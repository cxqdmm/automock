import Vue from "vue";
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
  Tag,
  Tooltip,
  RadioGroup,
  Radio,
} from "element-ui";
import App from "./App.vue";
Vue.component(Input.name, Input);
Vue.component(Table.name, Table);
Vue.component(Switch.name, Switch);
Vue.component(Button.name, Button);
Vue.component(TableColumn.name, TableColumn);
Vue.component(Dialog.name, Dialog);
Vue.component(Message.name, Message);
Vue.component(Select.name, Select);
Vue.component(Option.name, Option);
Vue.component(Divider.name, Divider);
Vue.component(Tag.name, Tag);
Vue.component(Tooltip.name, Tooltip);
Vue.component(RadioGroup.name, RadioGroup);
Vue.component(Radio.name, Radio);
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
