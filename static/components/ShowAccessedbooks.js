export default {
  template: `
  <div>
    <h1>Show Accessed Books</h1>
    <div v-if="accessedBooks.length > 0">
      <div style="max-width: 1000px; margin: 20px auto; border: 1px solid #ccc;">
        <table class="table">
          <thead>
            <tr>
              <th>Book Name</th>
              <th>Author</th>
              <th>Content</th>
              <th>Action</th> <!-- New column for action -->
            </tr>
          </thead>
          <tbody style="text-align:center">
            <tr v-for="book in accessedBooks" :key="book.id">
              <td>{{ book.name }}</td>
              <td>{{ book.author }}</td>
              <td v-html="book.content"></td>
              <td>
              <button @click="returnBook(book.id)" class="btn btn-danger" style="margin-right: 10px;">Return Book</button>
              <router-link :to="{ name: 'feedback', params: { book_id: book.id }}" style="display: inline-block; padding: 8px 16px; background-color: #007bff; color: #fff; text-decoration: none; border: none; border-radius: 8px; cursor: pointer; font-size: 15px;" class="feedback-button">Give Feedback</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <p>No books accessed yet.</p>
    </div>
  </div>
  `,
  data() {
    return {
      accessedBooks: []
    };
  },
  created() {
    this.fetchAccessedBooks();
  },
  methods: {
    fetchAccessedBooks() {
      const token = localStorage.getItem("auth-token");
      axios
        .get("/api/accessed-books", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("Network response was not ok");
          }
          return response.data;
        })
        .then((data) => {
          // Fetch the content for each accessed book
          Promise.all(data.map((book) => {
            return axios.get(`/api/book-content/${book.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          })).then((responses) => {
            responses.forEach((response, index) => {
              // Assign the content to the accessed book object
              data[index].content = response.data.content;
            });
            this.accessedBooks = data;
          }).catch((error) => {
            console.error("Error fetching book content:", error);
          });
        })
        .catch((error) => {
          console.error("Error fetching accessed books:", error);
        });
    },
    returnBook(bookId) {
      const token = localStorage.getItem("auth-token");
      axios
        .delete(`/api/return-book/${bookId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          // Remove the returned book from the list
          this.accessedBooks = this.accessedBooks.filter(book => book.id !== bookId);
          console.log(response.data.message);
        })
        .catch((error) => {
          console.error("Error returning book:", error);
        });
    },
  },
};
