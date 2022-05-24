<template>
  <div class="list">
    <div class="list-head">
      <div class="list-head-search">
        <div class="list-head-item">
          <span class="list-head-item-label">规则</span>
          <el-select
            class="list-head-item"
            v-model="search.pattern"
            @change="searchApi"
            placeholder="请选择关联的pattern"
          >
            <el-option
              v-for="item in activePatterns"
              :key="item.name"
              :label="item.name"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
        <el-input
          class="list-head-item list-head-name"
          clearable
          placeholder="接口名模糊匹配"
          v-model="search.name"
          @keyup.enter.native="searchApi"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="searchApi"
          ></el-button>
        </el-input>
      </div>
      <div class="list-head-action">
        <el-divider direction="vertical"></el-divider>
        <el-button @click="deleteAll">清空列表</el-button>
        <el-button @click="sortList()">mock前置</el-button>
      </div>
    </div>
    <div class="list-body">
      <el-table
        :data="list"
        height="800"
        border
        style="width: 100%"
        size="mini"
        row-key="name"
      >
        <el-table-column prop="name" label="接口名">
          <template slot-scope="scope">
            <div :class="{ hightlight: scope.row.mock }">
              {{ scope.row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="mockTime" label="命中mock时间" width="200">
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="200">
        </el-table-column>
        <el-table-column label="mock" width="100">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mock"
              @input="updateMock($event, scope.row)"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="showEditWindow(scope.row)">
              编辑
            </el-button>
            <el-button
              type="danger"
              size="mini"
              @click="deleteApi(scope.row, scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="list-footer"></div>
    <el-dialog
      title="编辑"
      fullscreen
      :visible.sync="dialogVisible"
      width="1000px"
      :before-close="() => (dialogVisible = false)"
    >
      <code-editor
        class="editor"
        ref="edit"
        v-model="view"
        :show-btns="false"
        :expanded-on-start="true"
        mode="code"
        lang="zh"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateApiData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  Input,
  Table,
  Switch,
  Button,
  TableColumn,
  Dialog,
  Message,
  Select,
  Option,
  Divider,
} from "element-ui";
import {
  search,
  updateApiData,
  updateApiMock,
  deleteApi,
  deleteAllApi,
  check,
  init,
} from "../service";
import dayjs from "dayjs";
import CodeEditor from "./code-editor";

export default {
  name: "api-list",
  components: {
    "el-input": Input,
    "el-table": Table,
    "el-switch": Switch,
    "el-button": Button,
    "el-table-column": TableColumn,
    "code-editor": CodeEditor,
    "el-dialog": Dialog,
    "el-select": Select,
    "el-option": Option,
    "el-divider": Divider,
  },
  mounted() {
    this.searchApi();
    this.autoUpdateList();
    this.getInit();
    document.addEventListener("visibilitychange", this.visibleChange);
  },
  data() {
    return {
      search: {
        name: "",
        pattern: "",
      },
      list: [],
      dialogVisible: false,
      activePatterns: [{ name: "全部", value: "" }], // whistle 激活的 automock 规则列表
      view: {},
    };
  },
  beforeDestroy() {
    document.removeEventListener("visibilitychange", this.visibleChange);
  },
  computed: {
    lockAutoUpdate() {
      if (this.dialogVisible) {
        return true;
      }
      return false;
    },
  },
  methods: {
    visibleChange() {
      this.pageShow();
    },
    // 获取主进程数据
    getInit() {
      init().then((data) => {
        const { rules } = data;
        this.getActivePatterns(rules);
      });
    },
    getActivePatterns(rules) {
      const { defaultRules, defaultRulesIsDisabled, list } = rules;
      let activePatterns = [];
      // 解析默认规则
      if (defaultRulesIsDisabled) {
        activePatterns = [];
      } else {
        activePatterns = defaultRules
          .split("\n")
          .map((i) => i.trim())
          .filter((i) => i[0] !== "#")
          .filter((i) => ~i.indexOf("automock://"))
          .map((i) => i.split(" ")[0]);
      }
      // 解析自定义规则
      let customActivePatterns = [];
      const customRules = list.filter((i) => i.selected);
      if (customRules.length) {
        customRules.forEach((rule) => {
          const patterns = rule.data
            .split("\n")
            .map((i) => i.trim())
            .filter((i) => i[0] !== "#")
            .filter((i) => ~i.indexOf("automock://"))
            .map((i) => i.split(" ")[0]);
          customActivePatterns.push(...patterns);
        });
      }
      activePatterns.push(...customActivePatterns);

      this.activePatterns = activePatterns.map((item) => ({
        name: item,
        value: item,
      }));
      this.activePatterns.unshift({ name: "全部", value: "" });
    },
    pageShow() {
      if (document.visibilityState === "visible") {
        this.searchApi();
        this.getInit();
      }
    },
    autoUpdateList() {
      setInterval(() => {
        check().then((res) => {
          const { code, data } = res;
          if (code === 200 && data) {
            if (!this.lockAutoUpdate) {
              this.searchApi();
            }
          }
        });
      }, 2000);
    },
    sortList() {
      this.list = this.sortByMock(this.list);
    },
    sortByMock(list) {
      const l1 = list.filter((item) => item.mock);
      const l2 = list.filter((item) => !item.mock);
      return l1.concat(l2);
    },
    showEditWindow(row) {
      this.editRow = row;
      try {
        this.view =
          typeof row.data === "string" ? JSON.parse(row.data) : row.data;
        this.dialogVisible = true;
      } catch (error) {
        Message.error(error.message);
      }
    },
    updateApiData() {
      this.editRow.data = this.view;
      updateApiData(this.editRow.name, this.view)
        .then((res) => {
          const { code, data } = res;
          if (code !== 200) {
            Message.error("更新失败");
          } else {
            const parseData = JSON.parse(data.data);
            this.editRow.time = parseData.time;
            this.editRow.data = parseData.data;
            this.editRow.updateTime = dayjs(parseData.time).format(
              "YYYY-MM-DD HH:mm:ss"
            );

            Message.success("更新成功");
            this.dialogVisible = false;
          }
        })
        .catch(() => {
          Message.error("更新失败");
        });
    },
    updateMock(mock, row) {
      updateApiMock(row.name, mock)
        .then((data) => {
          if (data.code !== 200) {
            Message.error("更新失败");
          } else {
            Message.success("更新成功");
          }
        })
        .catch(() => {
          Message.error("更新失败");
        });
    },
    deleteApi(row, index) {
      deleteApi(row.name)
        .then((data) => {
          if (data.code !== 200) {
            Message.error("删除失败");
          } else {
            Message.success("删除成功");
            this.list.splice(index, 1);
          }
        })
        .catch(() => {
          Message.error("删除失败");
        });
    },
    deleteAll() {
      deleteAllApi()
        .then((data) => {
          if (data.code !== 200) {
            Message.error("删除失败");
          } else {
            Message.success("删除成功");
            this.list = [];
          }
        })
        .catch(() => {
          Message.error("删除失败");
        });
    },
    searchApi() {
      search(this.search)
        .then((res) => {
          const { code, data } = res || {};
          if (code === 200) {
            const list = (data || []).map((item) => {
              try {
                return {
                  ...item,
                  updateTime: dayjs(item.time).format("YYYY-MM-DD HH:mm:ss"),
                  mockTime: item.mockTime
                    ? dayjs(item.mockTime).format("YYYY-MM-DD HH:mm:ss")
                    : "",
                };
              } catch (error) {
                return item;
              }
            });
            this.list = list;
          } else {
            Message.error("列表请求失败");
          }
        })
        .catch((err) => {
          Message.error(err);
        });
    },
  },
};
</script>

<style scoped>
.editor {
  height: 100%;
}
.list /deep/ .el-dialog {
  display: flex;
  flex-direction: column;
}
.list-head /deep/ .el-select {
  width: 300px;
}
.list /deep/ .el-dialog__body {
  flex: 1;
  padding: 0;
}
.list-head {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}
.list-head-search {
  flex: 1;
  display: flex;
  align-items: center;
}
.list-head-name {
  width: 400px;
}
.list-head-item {
  font-size: 14px;
  margin-right: 10px;
}
.list-head-item-label {
  font-size: 14px;
  font-weight: 500;
  margin-right: 10px;
}
.hightlight {
  color: blue;
}
</style>
