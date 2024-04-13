import Librariandashboard from "./Librariandashboard.js";
import Userdashboard from "./Userdashboard.js";

export default {
  template: `
    <div>
      <Librariandashboard v-if="is_Librarian" />
      <Userdashboard v-else />
    </div>
  `,
  data() {
    return {
      is_Librarian: false,
    };
  },
  created() {
    // Check if the user is a librarian
    const isLibrarian = this.$route.query.is_Librarian;
    this.is_Librarian = isLibrarian == 'true';
    localStorage.setItem('is_Librarian', isLibrarian); // Store the is_Librarian flag in local storage
    console.log(isLibrarian);
  },
  components: {
    Librariandashboard,
    Userdashboard, // Make sure Userdashboard is properly registered as a component
  },
};
