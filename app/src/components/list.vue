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
          placeholder="文件名模糊匹配"
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
          <el-table-column prop="name" label="文件名" min-width="300">
            <template slot-scope="scope">
              <div class="name">
                <div
                  class="name-value font-bold"
                  :class="{
                    blue: isActiveMockFile(scope.row.rule),
                  }"
                >
                  {{ scope.row.name }}
                </div>
              </div>
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
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button
                class="danger"
                type="text"
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
        <el-tabs type="border-card">
          <el-tab-pane label="详细信息">
            <div class="detail-item">
              <div class="label">status</div>
              <div class="value">{{ currentRow.status }}</div>
            </div>
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
              <div class="label">
                <el-tooltip
                  effect="light"
                  content="最近一次更新mock文件的时间"
                  placement="top"
                >
                  <i class="el-icon-info"></i>
                </el-tooltip>
                更新时间
              </div>
              <div class="value">{{ currentRow.updateTime }}</div>
            </div>
            <div class="detail-item">
              <div class="label">mock模式</div>
              <div class="value">{{ currentRow.ruleValue }}</div>
            </div>
            <div class="detail-item">
              <div class="label">
                <el-tooltip
                  effect="light"
                  content="最近一次命中mock的时间"
                  placement="top"
                >
                  <i class="el-icon-info"></i>
                </el-tooltip>
                mock时间
              </div>
              <div class="value">{{ currentRow.mockTime }}</div>
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
          <el-tab-pane label="response" v-if="currentRow.content">
            <code-editor
              ref="edit"
              v-model="currentRow.content"
              @input="handleFileChange(currentRow)"
              :show-btns="false"
              :expanded-on-start="true"
              mode="code"
              :modes="['code']"
              lang="zh"
            />
            <div class="edit-alert" v-if="!currentRow.mock">
              <i class="el-icon-info"></i>
              <span>非mock文件不支持修改</span>
            </div>
            <div class="save-btn" v-if="currentRow.effect">
              <span class="effect-icon"></span>
              <el-button
                size="small"
                type="primary"
                @click="handleUpdate(currentRow)"
                >保存</el-button
              >
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div v-else class="detail"></div>
    </div>
    <api-window
      :visible="editData.visible"
      :status="editData.status"
      :data="editData"
      @close="hideApiWindow"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script>
import Vue from "vue";
import { Message, MessageBox } from "element-ui";
import {
  search,
  updateApiData,
  updateApiMock,
  createApiData,
  deleteApi,
  batchDelete,
  getApiData,
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
        status: "create",
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
  watch: {
    currentRow(val) {
      if (val) {
        this.getCurrentRowData(val);
      }
    },
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
      this.activeRules.unshift({ name: "全部", value: "" });
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
    handleFileChange(row) {
      if (row.mock) {
        row.effect = true;
      }
    },
    getCurrentRowData(row) {
      this.currentRow.effect = false;
      try {
        getApiData(row.name)
          .then((res) => {
            const { code, data } = res;
            if (code !== 200) {
              Message.error("文件内容获取失败");
            } else {
              this.editData.status = row.mock ? "edit" : "view";
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
    hideApiWindow() {
      this.editData.visible = false;
    },
    handleUpdate(row) {
      this.updateApiData({
        row,
        name: row.name,
        content: row.content,
      });
    },
    handleConfirm({ content, name, ruleValue }) {
      this.editData.content = content;
      this.editData.name = name;
      this.editData.ruleValue = ruleValue;

      if (this.editData.status === "edit") {
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
      this.editData.status = "create";
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
            this.hideApiWindow();
            this.searchApi();
          }
        })
        .catch((error) => {
          Message.error(error.message || "更新失败");
        });
    },
    updateApiData({ row, name, content }) {
      updateApiData(name, content)
        .then((res) => {
          const { code, data } = res;
          if (code !== 200) {
            Message.error("更新失败");
          } else {
            row.effect = false;
            row.time = data.time;
            row.data = data.data;
            row.updateTime = dayjs(data.time).format("YYYY-MM-DD HH:mm:ss");
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
          }
        })
        .catch(() => {
          Message.error("更新失败");
        });
    },
    deleteApi(row, index) {
      if (row.mock) {
        MessageBox.confirm(
          "该文件是mock文件，删除会导致mock失效，是否继续?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            center: true,
          }
        )
          .then(() => {
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
          })
          .catch(() => {});
      } else {
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
    batchDelete() {
      batchDelete(this.search)
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
                  effect: false,
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
  flex: 1;
  border: 1px solid #ccc;
  border-left: none;
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
  }
  .detail {
    position: relative;
    flex: 1;
    overflow: hidden;
    border-left: 1px solid #ccc;
    margin-left: -2px;
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
.save-btn {
  position: absolute;
  top: 60px;
  right: 20px;
  .effect-icon {
    position: absolute;
    top: -5px;
    right: -5px;
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 6px;
    background-color: #f46c6b;
  }
}
.edit-alert {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #e6a23c;
}
</style>
