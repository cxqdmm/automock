<template>
  <div class="list">
    <div class="list-head"></div>
    <div class="list-body">
      <el-table :data="list" height="250" border style="width: 100%">
        <el-table-column prop="name" label="接口名"> </el-table-column>
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
            <el-button @click="edit(scope.row)"> 编辑 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="list-footer"></div>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="1000px"
      :before-close="handleClose"
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
  Table,
  Switch,
  Button,
  TableColumn,
  Dialog,
  Message,
} from "element-ui";
import { getApiList, updateApiData, updateApiMock } from "../service";
import CodeEditor from "./code-editor";
export default {
  name: "api-list",
  components: {
    "el-table": Table,
    "el-switch": Switch,
    "el-button": Button,
    "el-table-column": TableColumn,
    "code-editor": CodeEditor,
    "el-dialog": Dialog,
  },
  mounted() {
    console.log("请求数据");
    this.refreshList();
  },
  data() {
    return {
      list: [],
      dialogVisible: false,
      view: {},
    };
  },
  methods: {
    edit(row) {
      this.editRow = row;
      this.view =
        typeof row.data === "string" ? JSON.parse(row.data) : row.data;
      this.dialogVisible = true;
    },
    handleClose() {
      this.dialogVisible = false;
    },
    refreshList() {
      getApiList().then((data) => {
        this.list = (data || []).map((item) => {
          try {
            const data = JSON.parse(item.data);
            return {
              ...item,
              updateTime: data.time,
              data: data.data,
            };
          } catch (error) {
            return item;
          }
        });
        console.log("更新列表数据", this.list);
      });
    },
    updateApiData() {
      this.editRow.data = this.view;
      updateApiData(this.editRow.name, this.view)
        .then((data) => {
          if (data.code !== 200) {
            Message.error("更新失败");
          } else {
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
  },
};
</script>

<style scoped>
.editor {
  height: 400px;
}
</style>
