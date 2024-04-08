export default {
  template: `
  <div>
    <h1>Ebooks in Section "{{ sectionName }}"</h1>
    <div style="max-width: 1000px; margin: 20px auto; border: 1px solid #ccc;">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Content</th>
            <th>Author</th>
            <th>Date Issued</th>
            <th>Return Date</th>
            <th>Actions</th> 
          </tr>
        </thead>
        <tbody>
          <tr v-for="ebook in ebooks" :key="ebook.id">
            <td>{{ ebook.name }}</td>
            <td>{{ ebook.content }}</td>
            <td>{{ ebook.author }}</td>
            <td>{{ formatDate(ebook.date_issued) }}</td>
            <td>{{ formatDate(ebook.return_date) }}</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      ebooks: [], // Ensure ebooks is initialized as an array
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
          console.log(response.data);
          this.ebooks = response.data;
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
  },
}
