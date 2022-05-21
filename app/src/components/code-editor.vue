<template>
  <div class="json-editor">
    <div class="jsoneditor-vue"></div>
    <div v-if="showBtns !== false" class="jsoneditor-btns">
      <button
        class="json-save-btn"
        type="button"
        :disabled="error"
        @click="onSave()"
      >
        {{ locale[lang].save }}
      </button>
    </div>
  </div>
</template>

<script>
import "jsoneditor/dist/jsoneditor.min.css";
import JsonEditor from "jsoneditor";
export default {
  props: {
    value: [String, Number, Object, Array],
    showBtns: [Boolean],
    expandedOnStart: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "tree",
    },
    modes: {
      type: Array,
      default: function () {
        return ["tree", "code", "text", "view"];
      },
    },
    lang: {
      type: String,
      default: "en",
    },
  },
  data() {
    return {
      editor: null,
      error: false,
      json: this.value,
      internalChange: false,
      locale: {
        it: {
          save: "SALVA",
        },
        en: {
          save: "SAVE",
        },
        zh: {
          save: "保存",
        },
      },
    };
  },
  watch: {
    value: {
      immediate: true,
      async handler(val) {
        if (!this.internalChange) {
          await this.setEditor(val);
          this.error = false;
        }
      },
      deep: true,
    },
  },
  mounted() {
    let self = this;
    let options = {
      mode: this.mode,
      modes: this.modes, // allowed modes
      onChange() {
        try {
          let json = self.editor.get();
          self.json = json;
          self.error = false;
          self.$emit("json-change", json);
          self.internalChange = true;
          self.$emit("input", json);
          self.$nextTick(function () {
            self.internalChange = false;
          });
        } catch (e) {
          self.error = true;
          self.$emit("has-error", e);
        }
      },
      onModeChange() {},
    };
    this.editor = new JsonEditor(
      this.$el.querySelector(".jsoneditor-vue"),
      options,
      this.json
    );
  },
  methods: {
    onSave() {
      this.$emit("json-save", this.json);
    },
    async setEditor(value) {
      if (this.editor) this.editor.set(value);
    },
  },
};
</script>
<style lang="css" scoped>
.json-editor {
  height: 100%;
}
::v-deep .jsoneditor-vue {
  height: 100%;
}
::v-deep .jsoneditor {
  border: none;
}
::v-deep .jsoneditor-separator {
  vertical-align: middle !important;
}
::v-deep .jsoneditor-tree {
  vertical-align: middle !important;
}
::v-deep .jsoneditor-poweredBy {
  display: none;
}
</style>
