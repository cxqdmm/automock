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
        <el-button @click="handleCreate" size="mini" type="primary"
          >新建</el-button
        >
        <el-divider direction="vertical"></el-divider>
        <el-button
          v-if="search.onlymock"
          size="mini"
          type="danger"
          @click="batchDelete"
          >清空mock</el-button
        >
        <el-button v-else @click="batchDelete" size="mini" type="danger"
          >清空非mock项</el-button
        >
        <el-divider direction="vertical"></el-divider>
        <el-switch
          v-model="search.onlymock"
          @change="searchApi"
          active-text="显示mock"
          inactive-text="显示全部"
          active-color="#13ce66"
          inactive-color="#ff4949"
        >
        </el-switch>
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
        <el-table-column prop="pattern" label="规则" width="400">
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
            <el-button size="mini" @click="handleEdit(scope.row)">
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
    <api-window
      :is-edit="editData.isEdit"
      :visible="editData.visible"
      :data="editData"
      @close="hideApiWindow"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script>
import { Message } from "element-ui";
import {
  search,
  updateApiData,
  updateApiMock,
  createApiData,
  deleteApi,
  batchDelete,
  check,
  init,
} from "../service";
import dayjs from "dayjs";
import { getActivePatterns } from "../util";
import apiWindow from "./edit-window.vue";
export default {
  name: "api-list",
  components: {
    "api-window": apiWindow,
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
        onlymock: false,
      },
      list: [],
      activePatterns: [{ name: "全部", value: "" }], // whistle 激活的 automock 规则列表
      view: {},
      editRow: null,
      editData: {
        visible: false,
        isEdit: false,
        content: {},
        name: "",
      },
    };
  },
  beforeDestroy() {
    document.removeEventListener("visibilitychange", this.visibleChange);
  },
  computed: {
    lockAutoUpdate() {
      if (this.editData.visible) {
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
        activePatterns = getActivePatterns(defaultRules);
      }
      // 解析自定义规则
      let customActivePatterns = [];
      const customRules = list.filter((i) => i.selected);
      if (customRules.length) {
        customRules.forEach((rule) => {
          const patterns = getActivePatterns(rule.data);
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
    handleEdit(row) {
      try {
        this.editData.content =
          typeof row.data === "string" ? JSON.parse(row.data) : row.data;
        this.editRow = row;
        this.editData.isEdit = true;
        this.editData.visible = true;
        this.editData.name = row.name;
      } catch (error) {
        Message.error(error.message);
      }
    },
    hideApiWindow() {
      this.editData.visible = false;
    },
    handleConfirm({ content, name }) {
      this.editData.content = content;
      this.editData.name = name;

      if (this.editData.isEdit) {
        this.updateApiData({
          name: this.editData.name,
          content: content,
        });
      } else {
        this.createApi({
          name: this.editData.name,
          content: content,
        });
      }
    },
    handleCreate() {
      this.editData.isEdit = false;
      this.editData.content = {};
      this.editData.name = "";
      this.editData.visible = true;
    },
    createApi({ name, content }) {
      createApiData(name, content)
        .then((res) => {
          const { code, msg } = res;
          if (code !== 200) {
            Message.error(msg || "新建失败");
          } else {
            Message.success("新建成功");
            this.hideApiWindow();
            this.searchApi();
          }
        })
        .catch((error) => {
          Message.error(error.message || "更新失败");
        });
    },
    updateApiData({ name, content }) {
      updateApiData(name, content)
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
            this.hideApiWindow();
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
    batchDelete() {
      batchDelete(this.search)
        .then((data) => {
          if (data.code !== 200) {
            Message.error("删除失败");
          } else {
            Message.success("删除成功");
            this.searchApi();
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
.list-head /deep/ .el-select {
  width: 300px;
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
