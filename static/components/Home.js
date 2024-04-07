import Librariandashboard from "./Librariandashboard.js";
import Userdashboard from "./Userdashboard.js";

export default {
  template: `
    <div>
      <div>Welcome {{$route.query.username}}</div>
      <Librariandashboard v-if="is_Librarian" />
      <Userdashboard v-else />
    </div>
  `,
  data() {
    return {
      is_Librarian: this.$route.query.is_Librarian === 'true', // Convert string to boolean
    };
  },
  components: {
    Librariandashboard,
    Userdashboard,
  },
};
