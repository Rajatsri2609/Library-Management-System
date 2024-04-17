export default {
  template: `
    <div>
      <h1>Ebooks in Section "{{ sectionName }}"</h1>
      <router-link :to="'/sections/' + $route.params.sectionId + '/add-ebooks'" class='btn btn-success'>
        <i class="fas fa-plus fa-xs"></i>
          Add
      </router-link>
      <div v-if="ebooks.length > 0" style="max-width: 1000px; margin: 20px auto; border: 1px solid #ccc;">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Content</th>
              <th>Author</th>
              <th>Actions</th> 
            </tr>
          </thead>
          <tbody>
            <tr v-for="ebook in ebooks" :key="ebook.id">
              <td>{{ ebook.name }}</td>
              <td>{{ ebook.content }}</td>
              <td>{{ ebook.author }}</td>
              <td>
                <button @click="confirmDelete(ebook.id, ebook.name)" class="btn btn-danger">
                    Delete
                </button>
                <router-link :to="'/sections/' + $route.params.sectionId + '/ebooks/' + ebook.id + '/edit'" class="btn btn-primary">
                Edit
              </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else style="margin-top: 10px;">
        <h2>No ebooks available in this section :(</h2>
      </div>
    </div>
  `,
  data() {
    return {
      ebooks: [], 
      sectionName: ''
    };
  },
  created() {
    this.sectionName = this.$route.params.sectionName;
    this.fetchEbooks();
  },
  methods: {
    fetchEbooks() {
      const sectionId = this.$route.params.sectionId;
      const token = localStorage.getItem('auth-token');
      axios.get(`/api/sections/${sectionId}/ebooks`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(response => {
          this.ebooks = response.data.ebooks; // Update to access the ebooks array
          this.sectionName = response.data.section_name;
          console.log('Section Name:', this.sectionName);
        })
        .catch(error => {
          console.error('Error fetching ebooks:', error);
        });
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    confirmDelete(ebookId, ebookName) {
      this.$router.push({ name: 'DeleteEbook', params: { ebookId, ebookName} });
      console.log(`Deleting ebook with ID: ${ebookId}, Name: ${ebookName}`);
    }
  },
}
