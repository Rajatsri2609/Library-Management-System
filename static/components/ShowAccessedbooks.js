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
              </tr>
            </thead>
            <tbody style="text-align:center">
              <tr v-for="book in accessedBooks" :key="book.id">
                <td>{{ book.name }}</td>
                <td>{{ book.author }}</td>
                <td v-html="book.content"></td>
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
            data.forEach((book) => {
              axios
                .get(`/api/book-content/${book.id}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
                .then((response) => {
                  // Assign the content to the accessed book object
                  book.content = response.data.content;
                })
                .catch((error) => {
                  console.error("Error fetching book content:", error);
                });
            });
            this.accessedBooks = data;
          })
          .catch((error) => {
            console.error("Error fetching accessed books:", error);
          });
      },
    },
  };
  