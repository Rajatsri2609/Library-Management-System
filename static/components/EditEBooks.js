// EditEBooks.js
export default {
    template: `
      <div class="container" style="max-width: 600px; margin: 50px auto 20px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #fff;">
        <div class="edit-section-container">
          <h1>Edit Ebook</h1>
          <form @submit.prevent="editEbook">
            <div class="form-group" style="margin-bottom: 20px;">
              <label for="name" style="font-weight: bold; margin-bottom: 10px; display: block;">Name:</label>
              <input type="text" id="name" v-model="ebookData.name" class="form-control" style="width: 100%;background-color: #EBEBEB; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem;">
            </div>
            <div class="form-group" style="margin-bottom: 20px;">
              <label for="content" style="font-weight: bold; margin-bottom: 10px; display: block;">Content:</label>
              <textarea id="content" v-model="ebookData.content" class="form-control" style="width: 100%;background-color: #EBEBEB; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; resize: vertical; min-height: 150px;"></textarea>
            </div>
            <div class="form-group" style="margin-bottom: 20px;">
              <label for="author" style="font-weight: bold; margin-bottom: 10px; display: block;">Author:</label>
              <input type="text" id="author" v-model="ebookData.author" class="form-control" style="width: 100%;background-color: #EBEBEB; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem;">
            </div>
            <button type="submit" class="btn btn-primary" style="background-color: #007bff; color: #fff; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease;">Save</button>
          </form>
        </div>
      </div>
    `,
    data() {
      return {
        ebookData: {
          name: '',
          content: '',
          author: ''
        }
      };
    },
    created() {
      // Fetch ebook data and set it to ebookData
      this.fetchEbookData();
    },
    methods: {
      fetchEbookData() {
        const sectionId = this.$route.params.sectionId;
        const ebookId = this.$route.params.ebookId;
        const token = localStorage.getItem('auth-token');
        axios.get(`/api/sections/${sectionId}/ebooks/${ebookId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(response => {
            // Set ebookData to the fetched ebook data
            this.ebookData = response.data;
          })
          .catch(error => {
            console.error('Error fetching ebook data:', error);
          });
      },
      editEbook() {
        const sectionId = this.$route.params.sectionId;
        const ebookId = this.$route.params.ebookId;
        const token = localStorage.getItem('auth-token');
        axios.put(`/api/sections/${sectionId}/ebooks/${ebookId}`, this.ebookData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(response => {
            // Handle success
            console.log('Ebook edited successfully:', response.data);
            // Redirect to the show ebooks page
            this.$router.push({ name: 'ShowEBooks', params: { sectionId } });
          })
          .catch(error => {
            // Handle error
            console.error('Error editing ebook:', error);
          });
      }
    }
  };
  