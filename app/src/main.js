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
  RadioButton,
  Radio,
  Tabs,
  TabPane,
  Alert,
  Dropdown,
  DropdownItem,
  DropdownMenu,
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
Vue.component(RadioButton.name, RadioButton);
Vue.component(Radio.name, Radio);
Vue.component(Tabs.name, Tabs);
Vue.component(TabPane.name, TabPane);
Vue.component(Alert.name, Alert);
Vue.component(Dropdown.name, Dropdown);
Vue.component(DropdownItem.name, DropdownItem);
Vue.component(DropdownMenu.name, DropdownMenu);
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
