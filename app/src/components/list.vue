<template>
  <div class="list">
    <div class="list-head">
      <div class="list-head-search">
        <div class="list-head-item">
          <span class="list-head-item-label">规则</span>
          <el-select
            class="list-head-item"
            v-model="search.rule"
            @change="searchApi"
            placeholder="请选择关联的pattern"
          >
            <el-option
              v-for="item in activeRules"
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
          inactive-text=""
          active-color="#13ce66"
          inactive-color="#ff4949"
        >
        </el-switch>
      </div>
    </div>
    <div class="container">
      <div class="list-body" :class="{ 'show-detail': !!currentRow }">
        <el-table
          ref="table"
          :data="list"
          highlight-current-row
          height="800"
          border
          style="width: 100%"
          size="mini"
          row-key="name"
          @current-change="handleSelectRow"
        >
          <el-table-column prop="name" label="文件名" min-width="300">
            <template slot-scope="scope">
              <div class="name">
                <div
                  class="name-value font-bold"
                  :class="{
                    blue: scope.row.mock,
                  }"
                >
                  {{ scope.row.name }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column width="100" label="mock模式">
            <template slot-scope="scope">
              <el-tag
                class="name-tag font-bold"
                effect="dark"
                size="mini"
                type="success"
                >{{ scope.row.ruleValue }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="rule" min-width="300">
            <template slot="header">
              接口信息
              <el-tooltip
                effect="light"
                content="最近一次匹配的接口信息"
                placement="top"
              >
                <i class="el-icon-info"></i>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <div
                v-if="scope.row.rule"
                class="no-wrap line-height-1 blue font-bold flex align-center"
              >
                <span class="table-label">rule：</span>
                <div class="flex-1">{{ scope.row.rule }}</div>
              </div>
              <div
                v-if="scope.row.url"
                class="no-wrap line-height-1 font-bold flex align-baseline"
              >
                <span class="table-label">url：</span>
                <span class="flex-1">{{ scope.row.url }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="mockTime" width="140">
            <template slot="header">
              mock时间
              <el-tooltip
                effect="light"
                content="最近一次mock接口的时间"
                placement="top"
              >
                <i class="el-icon-info"></i>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" width="140">
            <template slot="header">
              更新时间
              <el-tooltip
                effect="light"
                content="文件最近一次更新的时间"
                placement="top"
              >
                <i class="el-icon-info"></i>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column width="80">
            <template slot="header">
              mock
              <el-tooltip
                effect="light"
                content="开启mock后，文件内容只能通过手动编辑修改"
                placement="top"
              >
                <i class="el-icon-info"></i>
              </el-tooltip>
            </template>
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
          <el-table-column label="操作" width="160">
            <template slot-scope="scope">
              <el-button size="mini" @click.stop="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click.stop="deleteApi(scope.row, scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="currentRow" class="detail">
        <i class="el-icon-close" @click="closeDetail"></i>
        <el-tabs type="border-card">
          <el-tab-pane label="详细信息">
            <div class="detail-item">
              <div class="label">文件名</div>
              <div class="value">{{ currentRow.name }}</div>
            </div>
            <div class="detail-item">
              <div class="label">url</div>
              <div class="value">{{ currentRow.url }}</div>
            </div>
            <div class="detail-item">
              <div class="label">rule</div>
              <div class="value">{{ currentRow.rule }}</div>
            </div>
            <div class="detail-item">
              <div class="label">updateTime</div>
              <div class="value">{{ currentRow.updateTime }}</div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="query">
            <div
              class="detail-item"
              v-for="key in Object.keys(currentRow.query || {})"
              :key="key"
            >
              <div class="label">{{ key }}</div>
              <div class="value">{{ currentRow.query[key] }}</div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="payload">
            <code-editor
              ref="edit"
              v-model="currentRow.payload"
              :show-btns="false"
              :expanded-on-start="true"
              mode="code"
              lang="zh"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
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
import { getActiveRules } from "../util";
import apiWindow from "./edit-window.vue";
import CodeEditor from "./code-editor";
export default {
  name: "api-list",
  components: {
    "api-window": apiWindow,
    "code-editor": CodeEditor,
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
        rule: "",
        onlymock: false,
      },
      list: [],
      activeRules: [{ name: "全部", value: "" }], // whistle 激活的 automock 规则列表
      view: {},
      editRow: null,
      editData: {
        visible: false,
        isEdit: false,
        content: {},
        name: "",
        ruleValue: "",
      },
      currentRow: null,
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
    closeDetail() {
      this.$refs.table.setCurrentRow();
    },
    // 获取主进程数据
    getInit() {
      init().then((data) => {
        const { rules } = data;
        this.getRules(rules);
      });
    },
    getRules(rules) {
      const { defaultRules, defaultRulesIsDisabled, list } = rules;
      let activeRules = [];
      // 解析默认规则
      if (defaultRulesIsDisabled) {
        activeRules = [];
      } else {
        activeRules = getActiveRules(defaultRules);
      }
      // 解析自定义规则
      let customActivePatterns = [];
      const customRules = list.filter((i) => i.selected);
      if (customRules.length) {
        customRules.forEach((rule) => {
          const patterns = getActiveRules(rule.data);
          customActivePatterns.push(...patterns);
        });
      }
      activeRules.push(...customActivePatterns);

      this.activeRules = activeRules.map((item) => ({
        name: item,
        value: item,
      }));
      this.activeRules.unshift({ name: "全部", value: "" });
    },
    pageShow() {
      if (document.visibilityState === "visible") {
        this.searchApi();
        this.getInit();
      }
    },
    handleSelectRow(val) {
      console.log(val);
      this.currentRow = val;
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
        this.editData.name = row.name;
        this.editData.ruleValue = row.ruleValue;
        this.editData.isEdit = true;
        this.editData.visible = true;
      } catch (error) {
        Message.error(error.message);
      }
    },
    hideApiWindow() {
      this.editData.visible = false;
    },
    handleConfirm({ content, name, ruleValue }) {
      this.editData.content = content;
      this.editData.name = name;
      this.editData.ruleValue = ruleValue;

      if (this.editData.isEdit) {
        this.updateApiData({
          name,
          content,
        });
      } else {
        this.createApi({
          name,
          content,
          ruleValue,
        });
      }
    },
    handleCreate() {
      this.editData.isEdit = false;
      this.editData.content = {};
      this.editData.name = "";
      this.editData.visible = true;
    },
    createApi(body) {
      createApiData(body)
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
                  expandUrl: false,
                  expandName: false,
                  payload: (item.payload && JSON.parse(item.payload)) || {},
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

<style scoped lang="less">
.list-head {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
  /deep/ .el-select {
    width: 300px;
  }
  &-search {
    flex: 1;
    display: flex;
    align-items: center;
  }
  &-name {
    width: 300px;
  }
  &-item {
    font-size: 14px;
    margin-right: 10px;
  }
  &-item-label {
    font-size: 14px;
    font-weight: 500;
    margin-right: 10px;
  }
}
.container {
  display: flex;
  .list-body {
    width: 100%;
    .name {
      position: relative;
      white-space: nowrap;
      line-height: 0;
    }
    .name-value {
      max-width: 100%;
      padding-right: 20px;
      display: inline-block;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      position: relative;
      line-height: 23px;
      vertical-align: top;
    }
    .name-expand-shadow {
      width: 500px;
      height: 23px;
      background: white;
      display: inline-block;
      z-index: 30;
      position: relative;
      transition: background-color 0.25s ease;
    }
    .name-expand-icon {
      width: 12px;
      position: absolute;
      top: 8px;
      right: 0;
      background: white;
      z-index: 1;
      transition: background-color 0.25s ease;
    }
    &.show-detail {
      width: 60%;
    }
  }
  .detail {
    position: relative;
    flex: 1;
    overflow: hidden;
    .el-icon-close {
      position: absolute;
      top: 0;
      cursor: pointer;
      right: 0;
      width: 28px;
      height: 28px;
      z-index: 1;
      font-size: 14px;
      line-height: 28px;
    }
    /deep/ .el-tabs {
      box-shadow: none;
      border-left: none;
      border-bottom: none;
      border-color: #ccc;
      height: 100%;
      display: flex;
      flex-direction: column;
      .el-tabs__content {
        padding: 0;
        flex: 1;
      }
      .el-tabs__header {
        background-color: white;
        border-bottom-color: #ccc;
      }
      .el-tabs__item {
        height: 27.5px;
        line-height: 27.5px;
        font-size: 12px;
        background-color: white;
        color: #333333;
        border-right-color: #ccc;
        border-left-color: #ccc;
        &.is-active {
          background-color: #e6e6e6;
        }
      }
      .el-tabs__nav-wrap {
        margin-bottom: 0;
      }
      .el-tab-pane {
        height: 100%;
      }
    }
    .detail-item {
      display: flex;
      font-size: 12px;
      border-bottom: 1px solid #cccccc;
      .label {
        flex: 0 0 100px;
        text-align: right;
        line-height: 1;
        padding: 4px 6px;
        font-weight: 400;
        background-color: #e0e3e6;
      }
      .value {
        padding: 4px 6px;
        line-height: 1;
        text-align: left;
        word-break: break-all;
      }
    }
  }
}

/deep/ .el-table {
  border-color: #ccc !important;
  .el-table__cell {
    border-color: #ccc !important;
  }
  .cell {
    line-height: 1 !important;
  }
  .el-table__row:hover .name-expand-shadow {
    background: #f4f7fa;
  }
  .el-table__row:hover .name-expand-icon {
    background: #f4f7fa;
  }
}
.highlight {
  color: blue;
}
.line-height-1 {
  line-height: 1.2;
}
.no-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.table-label {
  flex: 0 0 34px;
  text-align: right;
}
.blue {
  color: #3f9eff;
}
.font-bold {
  font-weight: 600;
}
.flex {
  display: flex;
}
.align-center {
  align-items: center;
}
.align-baseline {
  align-items: baseline;
}
.flex-1 {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
.expand {
  white-space: pre-wrap;
}
.expand-icon {
  width: 20px;
}
</style>
