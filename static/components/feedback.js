export default {
    template: `
    <div>
    <h1>Feedback Form</h1>
    <div style="max-width: 600px; margin: 50px auto 20px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #fff;">
        
        <form @submit.prevent="submitFeedback">
          <div style="margin-bottom: 20px;">
            <label for="rating" style="font-weight: bold; margin-bottom: 10px; display: block;">Rating:</label>
            <input type="number" id="rating" v-model="rating" required style="background-color: #EBEBEB; width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem;" />
          </div>
          <div style="margin-bottom: 20px;">
            <label for="comment" style="font-weight: bold; margin-bottom: 10px; display: block;">Comment:</label>
            <textarea id="comment" v-model="comment" style="background-color: #EBEBEB; width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; resize: vertical; min-height: 150px;"></textarea>
          </div>
          <button type="submit" style="background-color: #007bff; color: #fff; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease;">Submit Feedback</button>
        </form>
      </div>
    </div> 
    `,
    data() {
      return {
        rating: null,
        comment: ''
      };
    },
    methods: {
        submitFeedback() {
            if (!this.$route.params.book_id) {
                console.error('Book ID is not defined.');
                return;
            }
            
            // Prepare the data to be sent to the backend
            const data = {
                ebook_id: this.$route.params.book_id, // Access the book_id from route params
                rating: this.rating,
                comment: this.comment
            };
            
            // Get the token from localStorage
            const token = localStorage.getItem("auth-token");
            
            // Make a POST request to the feedback endpoint with bearer token
            axios.post(`/api/feedback/${this.$route.params.book_id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                // Feedback submitted successfully
                console.log(response.data.message);
                // Redirect to another page if needed
                this.$router.push('/api/accessed-books');
            })
            .catch(error => {
                // Handle errors
                console.error('Error submitting feedback:', error);
            });
        }
    }
}