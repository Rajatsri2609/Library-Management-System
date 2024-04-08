export default {
    template: `
      <div>
        <h1>Delete Confirmation</h1>
        <h2 class="text-center text-danger">Are you sure you want to delete "{{ sectionName }}"?</h2>
        <button @click="confirmDelete">Yes</button>
        <button @click="cancelDelete">No</button>
      </div>
    `,
    data() {
      return {
        sectionName: '',
        sectionId: null
      };
    },
    mounted() {
        this.sectionName = this.$route.params.sectionName;
        this.sectionId = this.$route.params.sectionId;
    },
      
    methods: {
      confirmDelete() {
        const token = localStorage.getItem('auth-token');
        axios.delete(`/api/sections/${this.sectionId}`, {
            headers: {
              Authorization: `Bearer ${token}` // Include the token in the Authorization header
            }
          })
          .then(response => {
            // Handle success
            this.$router.push('/librarian-dashboard');
          })
          .catch(error => {
            // Handle error
          });
      },
      cancelDelete() {
        this.$router.push('/librarian-dashboard');
      }
    }
  };
  