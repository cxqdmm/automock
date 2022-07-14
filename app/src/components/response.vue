<template>
  <div class="root">
    <div class="group">
      <div
        class="item"
        :class="{ selected: item === currentFile }"
        v-for="(item, index) in responseList"
        :Key="item.filename"
        @click="selectFile(item)"
      >
        <el-tooltip
          v-if="item.type === 'source'"
          effect="dark"
          content="Original Response"
          placement="top"
        >
          <i class="el-icon-warning-outline"></i>
        </el-tooltip>
        {{ item.filename }}
        <i
          v-if="item.type === 'history'"
          @click.stop="deleteVersion(item, index)"
          class="el-icon-delete"
          style="margin-left: 10px"
        ></i>
      </div>
      <div class="add" @click="onCreate">
        <el-tooltip
          effect="dark"
          content="Add response version"
          placement="top"
        >
          <i class="el-icon-plus"></i>
        </el-tooltip>
      </div>
    </div>
    <div class="content">
      <code-editor
        ref="edit"
        v-model="currentFile.content"
        @input="handleFileChange()"
        :show-btns="false"
        :expanded-on-start="true"
        mode="code"
        :modes="['code']"
        lang="zh"
      />
      <div class="edit-alert" v-if="!api.mock && currentFile.type === 'source'">
        <i class="el-icon-warning-outline"></i>
        <span
          >The original response cannot be modified when mock is turned
          off</span
        >
      </div>
      <div
        class="save-btn"
        v-if="
          currentFile.effect && (currentFile.type === 'history' || api.mock)
        "
      >
        <span class="effect-icon"></span>
        <el-button size="small" type="primary" @click="handleUpdate()"
          >Save</el-button
        >
      </div>
    </div>
    <el-dialog :visible.sync="versionModal.visible" width="30%">
      <div class="flex">
        <div style="white-space: nowrap">Version：</div>
        <el-input v-model="versionModal.name"></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="versionModal.visible = false">Cancel</el-button>
        <el-button type="primary" @click="handleVersionConfirm"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Vue from "vue";
import CodeEditor from "./code-editor";
import { Message } from "element-ui";
import {
  getApiData,
  getVersions,
  updateApiData,
  addVersion,
  deleteVersion,
  updateVersionContent,
  setMockVersion,
} from "../service";

export default {
  name: "response-manage",
  props: {
    api: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    "code-editor": CodeEditor,
  },
  computed: {
    name() {
      return this.api.name;
    },
    mock() {
      return this.api.mock;
    },
    mockVersion() {
      return this.api.mockVersion;
    },
    date() {
      return this.api.date;
    },
  },
  watch: {
    name: {
      handler() {
        this.responseList = [];
        this.currentFile = {
          content: {},
        };
        this.getSourceVersion();
        this.getHistoryVersions();
      },
      immediate: true,
    },
    date() {
      if (!this.mock) {
        this.getSourceVersion();
      }
    },
  },
  data() {
    return {
      responseList: [],
      currentFile: {},
      versionModal: {
        visible: false,
        status: "create",
        name: "",
      },
    };
  },

  methods: {
    onCreate() {
      this.versionModal.status = "create";
      this.versionModal.name = "";
      this.versionModal.visible = true;
    },
    deleteVersion(item, index) {
      deleteVersion({ name: this.api.name, versionName: item.filename })
        .then((res) => {
          const { code } = res;
          if (code === 200) {
            if (item === this.currentFile) {
              this.currentFile = this.responseList[0] || {};
            }
            this.responseList.splice(index, 1);
          } else {
            Message.error("新建失败");
          }
        })
        .catch((err) => {
          console.log(err);
          Message.error("新建失败");
        });
    },
    handleVersionConfirm() {
      if (this.versionModal.name) {
        addVersion({
          versionName: this.versionModal.name,
          name: this.api.name,
        })
          .then((res) => {
            const { code, data } = res;
            if (code !== 200) {
              Message.error("新建失败");
            }
            this.versionModal.visible = false;
            this.responseList.push({
              type: "history",
              ...data,
            });
          })
          .catch((err) => {
            console.log(err);
            Message.error("新建失败");
          });
      }
    },
    selectFile(item) {
      this.currentFile = item;
      const versionName = item.type === "history" ? item.filename : "";
      setMockVersion({ name: this.api.name, versionName })
        .then((res) => {
          const { code } = res;
          if (code !== 200) {
            Message.error("更新mock版本失败");
          } else {
            this.$emit("changeMockVersion", versionName);
          }
        })
        .catch((err) => {
          console.log(err);
          Message.error("更新mock版本失败");
        });
    },
    handleFileChange() {
      Vue.set(this.currentFile, "effect", true);
    },
    handleUpdate() {
      if (this.currentFile.type === "history") {
        this.updateHistory();
      } else {
        this.updateApiData();
      }
    },
    updateHistory() {
      updateVersionContent({
        versionName: this.currentFile.filename,
        content: this.currentFile.content,
        name: this.api.name,
      })
        .then((res) => {
          const { code } = res;
          if (code !== 200) {
            Message.error("更新失败");
          } else {
            Vue.set(this.currentFile, "effect", false);
          }
        })
        .catch((err) => {
          console.log(err);
          Message.error("更新失败");
        });
    },
    updateApiData() {
      updateApiData(this.api.name, this.currentFile.content)
        .then((res) => {
          const { code } = res;
          if (code !== 200) {
            Message.error("更新失败");
          } else {
            Vue.set(this.currentFile, "effect", false);
          }
        })
        .catch((err) => {
          console.log(err);
          Message.error("更新失败");
        });
    },
    getSourceVersion() {
      try {
        getApiData(this.name)
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
              let file = {
                filename: "source",
                type: "source",
                content,
              };
              const index = this.responseList.findIndex(
                (item) => item.filename === "source"
              );
              if (index > -1) {
                this.responseList.splice(index, 1, file);
              } else {
                this.responseList.unshift(file);
              }
              if (!this.mockVersion) {
                this.currentFile = file;
              }
            }
          })
          .catch(() => {
            Message.error("文件内容获取失败");
          });
      } catch (error) {
        Message.error(error.message);
      }
    },
    getHistoryVersions() {
      try {
        getVersions({ name: this.name })
          .then((res) => {
            const { code, data } = res;
            if (code !== 200) {
              Message.error("文件内容获取失败");
            } else {
              let content = [];

              try {
                content = typeof data === "string" ? JSON.parse(data) : data;
              } catch (error) {
                console.log(error);
              }
              content.forEach((item) => {
                item.type = "history";
              });
              const currentFile = content.find(
                (item) => item.filename === this.mockVersion
              );
              this.responseList.push(...content);
              if (currentFile) {
                this.currentFile = currentFile;
              }
            }
          })
          .catch(() => {
            Message.error("文件内容获取失败");
          });
      } catch (error) {
        Message.error(error.message);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.root {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  .group {
    display: flex;
    flex-wrap: wrap;
    .item {
      position: relative;
      cursor: pointer;
      height: 24px;
      padding: 0px 10px;
      font-size: 12px;
      line-height: 24px;
      color: #333333;
      font-weight: 500;
      border-right: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
      &.selected {
        background-color: #e0e3e6;
      }
      .el-icon-delete:hover {
        color: #f46c6b;
      }
    }
    .add {
      cursor: pointer;
      line-height: 24px;
      padding: 0px 10px;
      color: #333333;
      font-weight: 500;
    }
  }
  .content {
    position: relative;
    flex: 1;
    overflow: hidden;
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
.save-btn {
  position: absolute;
  top: 100px;
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
.flex {
  display: flex;
  align-items: center;
}
</style>
