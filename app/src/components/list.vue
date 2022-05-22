<template>
  <div class="list">
    <div class="list-head">
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
      <div class="list-head-item">
        <span>mock前置: </span>
        <el-switch
          v-model="isMockFront"
          @input="sortList()"
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
  Input,
  Table,
  Switch,
  Button,
  TableColumn,
  Dialog,
  Message,
} from "element-ui";
import { search, updateApiData, updateApiMock, deleteApi } from "../service";
import { formatTime } from "../util/time";
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
  },
  mounted() {
    console.log("请求数据");
    this.searchApi();
  },
  data() {
    return {
      search: {
        name: "",
      },
      isMockFront: true, // mock 项前置
      list: [],
      dialogVisible: false,
      view: {},
    };
  },
  methods: {
    sortList() {
      this.list = this.sortByMock(this.list);
    },
    sortByMock(list) {
      if (this.isMockFront) {
        const l1 = list.filter((item) => item.mock);
        const l2 = list.filter((item) => !item.mock);
        return l1.concat(l2);
      }
      return list;
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
    handleClose() {
      this.dialogVisible = false;
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
    searchApi() {
      search({ name: this.search.name }).then((data) => {
        const list = (data || []).map((item) => {
          try {
            const data = JSON.parse(item.data);
            return {
              ...item,
              ...data,
              updateTime: formatTime(data.time),
              mockTime: item.mockTime ? formatTime(item.mockTime) : "",
            };
          } catch (error) {
            return item;
          }
        });
        this.list = this.sortByMock(list);
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
/deep/ .el-dialog__body {
  flex: 1;
  padding: 0;
}
.list-head {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}
.list-head-name {
  width: 400px;
}
.list-head-item {
  font-size: 14px;
  margin-right: 20px;
}
.hightlight {
  color: blue;
}
</style>
