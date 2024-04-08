export default {
    template: `
      <div style="max-width: 600px; margin: 50px auto 20px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #fff;">
        <h1>Add Section</h1>
        <form @submit.prevent="addSection" style="margin-bottom: 20px;">
          <div style="margin-bottom: 20px;">
            <label for="sectionName" style="font-weight: bold; margin-bottom: 10px; display: block;">Section Name:</label>
            <input type="text" id="sectionName" v-model="sectionName" style="background-color: #EBEBEB; width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem;" required>
          </div>
          <div style="margin-bottom: 20px;">
            <label for="sectionDescription" style="font-weight: bold; margin-bottom: 10px; display: block;">Description:</label>
            <textarea id="sectionDescription" v-model="sectionDescription" style="background-color: #EBEBEB; width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; resize: vertical; min-height: 150px;"></textarea>
          </div>
          <button type="submit" style="background-color: #007bff; color: #fff; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease;">Add Section</button>
        </form>
      </div>
    `,
    data() {
      return {
        sectionName: '',
        sectionDescription: ''
      };
    },
    methods: {
      addSection() {
        const token = localStorage.getItem('auth-token');
        axios.post('/api/add-section', {
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
          console.error('Error adding section:', error);
        });
      }
    }
  };
  