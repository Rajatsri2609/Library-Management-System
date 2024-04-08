
export default {
  template: `
    <div class="container" style="max-width: 600px; margin: 50px auto 20px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #fff;">
      <div class="edit-section-container">
        <div>
          <h1>Edit Section</h1>
          <div class="form-group" style="margin-bottom: 20px;">
            <label for="sectionName" style="font-weight: bold; margin-bottom: 10px; display: block;">New name:</label>
            <input type="text" id="sectionName" v-model="sectionName" style="background-color: #EBEBEB; width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem;" />
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label for="sectionDescription" style="font-weight: bold; margin-bottom: 10px; display: block;">New Description:</label>
            <textarea id="sectionDescription" v-model="sectionDescription" style="background-color: #EBEBEB; width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; resize: vertical; min-height: 150px;"></textarea>
          </div>
          <button @click="saveChanges" style="background-color: #007bff; color: #fff; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease;">Save Changes</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      sectionName: '',
      sectionDescription: '',
      sectionId: null
    };
  },
  created() {
    this.sectionId = this.$route.params.id;
    this.fetchSectionDetails();
  },
  methods: {
    fetchSectionDetails() {
      const token = localStorage.getItem('auth-token'); // Retrieve the authentication token from local storage
      if (!token) {
        console.error('No authentication token found.');
        return;
      }

      axios.get(`/api/sections/${this.sectionId}`, {
        headers: {
          Authorization: `Bearer ${token}` // Attach the token to the request headers
        }
      })
      .then(response => {
        const section = response.data;
        this.sectionName = section.name;
        this.sectionDescription = section.description;
      })
      .catch(error => {
        console.error('Error fetching section details:', error);
      });
    },
    saveChanges() {
      const token = localStorage.getItem('auth-token');
      axios.put(`/api/sections/${this.sectionId}`, {
        name: this.sectionName,
        description: this.sectionDescription
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        console.log(response.data);
        this.$router.push('/librarian-dashboard');
      })
      .catch(error => {
        console.error('Error updating section:', error);
      });
    },
  },
};
