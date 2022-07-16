<template>
  <div class="list">
    <div class="list-head">
      <div class="list-head-search">
        <div class="list-head-item">
          <span class="list-head-item-label">Rule</span>
          <el-select
            class="list-head-item"
            size="small"
            v-model="searchParam.rule"
            @change="searchApi"
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
          class="list-head-item list-head-name m-l-10"
          clearable
          size="small"
          placeholder="Fuzzy Search"
          v-model="searchParam.name"
          @keyup.enter.native="searchApi"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="searchApi"
          ></el-button>
        </el-input>
        <el-divider direction="vertical"></el-divider>
        <el-radio-group
          v-model="searchParam.range"
          size="small"
          @change="searchApi"
        >
          <el-radio-button label="all">All</el-radio-button>
          <el-radio-button label="mocking">Mocking</el-radio-button>
          <el-radio-button label="not-mocking">Not Mocking</el-radio-button>
          <el-radio-button label="locked">Locked</el-radio-button>
        </el-radio-group>
        <el-divider direction="vertical"></el-divider>
        <el-radio-group
          v-model="searchParam.ruleValue"
          size="small"
          @change="searchApi"
        >
          <el-radio-button label="all">All</el-radio-button>
          <el-radio-button label="pathname">pathname</el-radio-button>
          <el-radio-button label="href">href</el-radio-button>
          <el-radio-button label="pattern">pattern</el-radio-button>
        </el-radio-group>
      </div>
      <div class="list-head-action">
        <el-button
          @click="handleCreate"
          icon="el-icon-plus"
          size="mini"
          type="primary"
        ></el-button>
        <el-divider
          v-if="searchParam.range !== 'locked'"
          direction="vertical"
        ></el-divider>
        <el-dropdown
          v-if="searchParam.range === 'all'"
          size="mini"
          @command="handleBatchDelete"
        >
          <el-button type="primary" size="mini">
            Delete<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="mocking">Mocking</el-dropdown-item>
            <el-dropdown-item command="not-mocking"
              >Not Mocking</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          v-if="searchParam.range === 'mocking'"
          size="mini"
          type="danger"
          @click="handleBatchDelete('mocking')"
          >Delete</el-button
        >
        <el-button
          v-if="searchParam.range === 'not-mocking'"
          @click="handleBatchDelete('not-mocking')"
          size="mini"
          type="danger"
          >Delete</el-button
        >
        <el-tooltip
          v-if="searchParam.range !== 'locked'"
          class="m-l-10"
          effect="dark"
          content="Locked files can not deleted in batches"
          placement="top"
        >
          <i class="el-icon-warning-outline"></i>
        </el-tooltip>
      </div>
    </div>
    <div class="container">
      <div class="list-body">
        <el-table
          ref="table"
          :data="list"
          :highlight-current-row="true"
          :current-row-key="(currentRow && currentRow.name) || ''"
          height="100%"
          border
          style="width: 100%"
          size="mini"
          row-key="name"
          @current-change="handleSelectRow"
        >
          <el-table-column prop="name" label="#" width="40">
            <template slot-scope="scope">{{ scope.$index + 1 }} </template>
          </el-table-column>
          <el-table-column prop="name" label="Filename" min-width="300">
            <template slot-scope="scope">
              <div class="name">
                <div
                  class="name-value font-bold"
                  :class="{
                    blue: isActiveMockFile(scope.row.rule) && scope.row.mock,
                    error: scope.row.status && scope.row.status !== 200,
                  }"
                >
                  {{ scope.row.name }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column width="70" align="center">
            <template slot="header"> Mock </template>
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.mock"
                @input="updateMock($event, scope.row)"
                active-color="#3f9eff"
                inactive-color="#ccc"
              >
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="Operation" width="80" align="center">
            <template slot-scope="scope">
              <el-button
                class="danger icon"
                type="text"
                size="mini"
                icon="el-icon-delete"
                @click.stop="handleDelete(scope.row, scope.$index)"
              >
              </el-button>
              <el-button
                type="text"
                class="icon"
                :class="{ green: scope.row.locked }"
                size="mini"
                :icon="scope.row.locked ? 'el-icon-lock' : 'el-icon-unlock'"
                @click.stop="updateLock(!scope.row.locked, scope.row)"
              >
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="currentRow" class="detail">
        <el-tabs type="border-card">
          <el-tab-pane label="Overview">
            <div class="detail-item">
              <div class="label">Mock Mode</div>
              <div class="value">{{ currentRow.ruleValue }}</div>
            </div>
            <div class="detail-item">
              <div class="label">Status</div>
              <div class="value">{{ currentRow.status }}</div>
            </div>
            <div class="detail-item">
              <div class="label">Filename</div>
              <div class="value">{{ currentRow.name }}</div>
            </div>
            <div class="detail-item">
              <div class="label">Url</div>
              <div class="value">{{ currentRow.url }}</div>
            </div>
            <div class="detail-item">
              <div class="label">Rule</div>
              <div class="value">{{ currentRow.rule }}</div>
            </div>
            <div class="detail-item">
              <div class="label">Date</div>
              <div class="value">{{ currentRow.date }}</div>
            </div>
            <div class="detail-item">
              <div class="label">
                <el-tooltip
                  effect="dark"
                  content="The latest hitting the mock"
                  placement="top"
                >
                  <i class="el-icon-warning-outline"></i>
                </el-tooltip>
                Mock Date
              </div>
              <div class="value">{{ currentRow.mockTime }}</div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Query">
            <div
              class="detail-item"
              v-for="key in Object.keys(currentRow.query || {})"
              :key="key"
            >
              <div class="label">{{ key }}</div>
              <div class="value">{{ currentRow.query[key] }}</div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Payload">
            <code-editor
              ref="edit"
              v-model="currentRow.payload"
              :show-btns="false"
              :expanded-on-start="true"
              mode="code"
              lang="zh"
            />
          </el-tab-pane>
          <el-tab-pane v-if="currentRow">
            <span slot="label">Response</span>
            <response
              :api="currentRow"
              @changeMockVersion="handeMockVersionChange"
            ></response>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div v-else class="detail"></div>
    </div>
    <api-window ref="create" @confirm="handleConfirm" />
  </div>
</template>

<script>
import Vue from "vue";
import { Message, MessageBox } from "element-ui";
import {
  search,
  updateApiMock,
  createApiData,
  deleteApi,
  batchDelete,
  updateApiLock,
  getApiData,
  check,
  init,
} from "../service";
import dayjs from "dayjs";
import { getActiveRules } from "../util";
import apiWindow from "./edit-window.vue";
import CodeEditor from "./code-editor";
import response from "./response";
export default {
  name: "api-list",
  components: {
    "api-window": apiWindow,
    "code-editor": CodeEditor,
    response: response,
  },
  mounted() {
    this.searchApi();
    this.autoUpdateList();
    this.getInit();
    document.addEventListener("visibilitychange", this.visibleChange);
  },
  data() {
    return {
      searchParam: {
        name: "",
        rule: "",
        range: "all", // "all" | "mocking" | "not-mocking" | "locked"
        ruleValue: "all", // "all" | "pathname" | "href" | "pattern"
      },
      list: [],
      activeRules: [{ name: "All", value: "" }], // whistle 激活的 automock 规则列表
      view: {},
      currentRow: null,
    };
  },
  beforeDestroy() {
    document.removeEventListener("visibilitychange", this.visibleChange);
  },
  watch: {
    currentRow(val) {
      if (val) {
        this.getCurrentRowData(val);
      }
    },
  },
  computed: {
    lockAutoUpdate() {
      return false;
    },
  },
  methods: {
    visibleChange() {
      this.pageShow();
    },
    isActiveMockFile(rule) {
      // 判断当前mock文件是否被激活
      return this.activeRules.some((item) => item.value === rule);
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
      this.activeRules.unshift({ name: "All", value: "" });
    },
    pageShow() {
      if (document.visibilityState === "visible") {
        this.searchApi();
        this.getInit();
      }
    },
    handleSelectRow(val) {
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
    getCurrentRowData(row) {
      try {
        getApiData(row.name)
          .then((res) => {
            const { code, data } = res;
            if (code !== 200) {
              Message.error("文件内容获取失败");
            } else {
              let content = {};
              try {
                content =
                  typeof data.data === "string"
                    ? JSON.parse(data.data)
                    : data.data;
              } catch (error) {
                console.log(error);
              }
              Vue.set(this.currentRow, "content", content);
            }
          })
          .catch(() => {
            Message.error("文件内容获取失败");
          });
      } catch (error) {
        Message.error(error.message);
      }
    },
    changeCurrentRow() {
      this.$nextTick(() => {
        let currentRow = this.list[0];
        if (this.currentRow) {
          currentRow = this.list.find(
            (item) => this.currentRow.name === item.name
          );
        }
        this.currentRow = currentRow;
      });
    },
    handeMockVersionChange(versionName) {
      this.currentRow.mockVersion = versionName;
    },
    handleConfirm({ content, name, ruleValue }) {
      this.createApi({
        name,
        content,
        ruleValue,
      });
    },
    handleCreate() {
      this.$refs.create.show();
    },
    createApi(body) {
      createApiData(body)
        .then((res) => {
          const { code, msg } = res;
          if (code !== 200) {
            Message.error(msg || "新建失败");
          } else {
            this.$refs.create.close();
            this.searchApi();
          }
        })
        .catch((error) => {
          Message.error(error.message || "更新失败");
        });
    },
    updateLock(locked, row) {
      updateApiLock(row.name, locked)
        .then((data) => {
          if (data.code !== 200) {
            Message.error("更新失败");
          } else {
            row.locked = locked;
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
          }
        })
        .catch(() => {
          Message.error("更新失败");
        });
    },
    handleDelete(row, index) {
      deleteApi(row.name)
        .then((data) => {
          if (data.code !== 200) {
            Message.error("删除失败");
          } else {
            this.list.splice(index, 1);
            this.changeCurrentRow();
          }
        })
        .catch(() => {
          Message.error("删除失败");
        });
    },
    handleBatchDelete(range) {
      let title = "",
        message = "";
      range === "mocking" &&
        ((title = "确定删除开启mock的文件么?"),
        (message = "删除后将丢失mock文件"));
      if (title) {
        MessageBox.confirm(message, title, {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true,
        })
          .then(() => {
            batchDelete({ ...this.searchParam, range })
              .then((data) => {
                if (data.code !== 200) {
                  Message.error("删除失败");
                } else {
                  this.searchApi();
                }
              })
              .catch(() => {
                Message.error("删除失败");
              });
          })
          .catch(() => {});
      } else {
        batchDelete({ ...this.searchParam, range })
          .then((data) => {
            if (data.code !== 200) {
              Message.error("删除失败");
            } else {
              this.searchApi();
            }
          })
          .catch(() => {
            Message.error("删除失败");
          });
      }
    },
    searchApi() {
      search(this.searchParam)
        .then((res) => {
          const { code, data } = res || {};
          if (code === 200) {
            const list = (data || []).map((item) => {
              try {
                return {
                  ...item,
                  expandUrl: false,
                  expandName: false,
                  locked: item.locked,
                  payload: (item.payload && JSON.parse(item.payload)) || {},
                  date: dayjs(item.date).format("YYYY-MM-DD HH:mm:ss"),
                  mockTime: item.mockTime
                    ? dayjs(item.mockTime).format("YYYY-MM-DD HH:mm:ss")
                    : "",
                };
              } catch (error) {
                return item;
              }
            });
            this.list = list;
            this.changeCurrentRow();
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
.default-text-btn {
  color: #606266;
}
.list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.list-head {
  display: flex;
  padding: 10px;
  align-items: center;
  /deep/ .el-select {
    width: 250px;
  }
  &-action {
    display: flex;
    align-items: center;
  }
  &-search {
    flex: 1;
    display: flex;
    align-items: center;
  }
  &-name {
    width: 250px;
  }
  &-item {
    font-size: 14px;
  }
  &-item-label {
    font-size: 14px;
    font-weight: 500;
    margin-right: 10px;
  }
}
.container {
  display: flex;
  flex: 1;
  border: 1px solid #ccc;
  border-left: none;
  overflow: hidden;
  .list-body {
    width: 55%;
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
    /deep/ .el-table th.el-table__cell > .cell {
      color: #333;
      font-weight: 500;
    }
  }
  .detail {
    position: relative;
    flex: 1;
    overflow: hidden;
    border-left: 1px solid #ccc;
    margin-left: -2px;
    background: white;
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
      border: none;
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
        height: 30px;
        line-height: 30px;
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
  border-left: none;
  border-bottom: none;
  border-top: none;
  &::before,
  &::after {
    content: none;
  }
  .el-table__cell {
    border-color: #ccc !important;
  }
  .el-table__body .el-table__cell {
    padding: 0 !important;
  }
  .cell {
    line-height: 1.4 !important;
  }
  .el-table__row:hover .name-expand-shadow {
    background: #f4f7fa;
  }
  .el-table__row:hover .name-expand-icon {
    background: #f4f7fa;
  }
  .el-button.danger {
    color: #fe4949;
  }
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
  font-weight: bold;
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
.m-l-4 {
  margin-left: 4px;
}
.m-l-10 {
  margin-left: 10px;
}
.m-r-10 {
  margin-right: 10px;
}
.icon {
  font-size: 16px;
  padding: 4px 2px;
}
.error {
  color: tomato;
}
.green {
  color: #67c23a;
}
</style>
