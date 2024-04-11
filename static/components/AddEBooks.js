export default {
  template: `
    <div style="max-width: 600px; margin: 50px auto 20px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #fff;">
      <h1>Add Ebook</h1>
      <form @submit.prevent="addEbook" style="margin-bottom: 20px;">
        <div style="margin-bottom: 20px;">
          <label for="name" style="font-weight: bold; margin-bottom: 10px; display: block; color: #333;">Name:</label>
          <input type="text" id="name" v-model="ebook.name" required style="background-color: #EBEBEB; width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem;">
        </div>
        <div style="margin-bottom: 20px;">
          <label for="content" style="font-weight: bold; margin-bottom: 10px; display: block; color: #333;">Content:</label>
          <textarea id="content" v-model="ebook.content" required style="background-color: #EBEBEB; width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; resize: vertical; min-height: 150px;"></textarea>
        </div>
        <div style="margin-bottom: 20px;">
          <label for="author" style="font-weight: bold; margin-bottom: 10px; display: block; color: #333;">Author:</label>
          <input type="text" id="author" v-model="ebook.author" required style="background-color: #EBEBEB; width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem;">
        </div>
        <button type="submit" style="background-color: #007bff; color: #fff; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease;">Add Ebook</button>
      </form>
    </div>
  `,
  data() {
    return {
      ebook: {
        name: '',
        content: '',
        author: '',
        dateIssued: '',
        returnDate: ''
      }
    };
  },
  computed: {
    todayDate() {
      return new Date().toISOString().split('T')[0];
    }
  },
  methods: {
    addEbook() {
      console.log('Ebook data:', this.ebook);

      const sectionId = this.$route.params.sectionId;
      const token = localStorage.getItem('auth-token');
      axios.post(`/api/sections/${sectionId}/ebooks`, this.ebook, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(response => {
          console.log('Ebook added successfully:', response.data);
          this.$router.push('/librarian-dashboard');
          // Redirect to the ShowEBooks component or perform any other action after adding the ebook
        })
        .catch(error => {
          console.error('Error adding ebook:', error);
        });
    }
  }
}
