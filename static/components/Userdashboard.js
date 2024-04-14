export default {
  template: `
  <div>
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="Search...">
      <select v-model="searchBasis">
        <option value="section">Section</option>
        <option value="name">Book Name</option>
        <option value="author">Author</option>
      </select>
      <button @click="search" class="btn btn-primary">Search</button>
    </div>
    <h1>Welcome {{ username }}!</h1>
    <div style="display: flex; flex-direction: column; align-items: center; padding: 1em;justify-content: center;" class="section-list">
      <div v-for="section in filteredSections" :key="section.id" class="section" style="width: 100%; margin: 32px 0;">
        <h3>{{ section.name }}</h3>
        <div class="ebook-list" style="display: flex; flex-wrap: wrap;">
          <div v-if="section.ebooks.length > 0" v-for="ebook in section.ebooks" :key="ebook.id" class="product" style="width: 300px; margin: 16px; padding: 16px; border: 1px solid #ccc; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-direction: column;">
            <div class="ebook-description" style="display: flex; flex-direction: column; align-items: flex-start;">
              <h4 style="margin: 0;">{{ ebook.name }}</h4>
              <p style="margin: 0;">Author: {{ ebook.author }}</p>
              <template v-if="!ebook.accessRequested && !ebook.accessGranted">
                <button @click="requestAccess(section.id, ebook)" class="btn btn-success">Request Access</button>
              </template>
              <template v-else-if="ebook.accessRequested && !ebook.accessGranted">
                <p>Request Pending...</p>
              </template>
              <template v-else-if="ebook.accessGranted">
                <button @click="showContent(ebook)" class="btn btn-primary">Show Content</button>
              </template>
            </div>
          </div>
        </div>
        <p v-if="section.ebooks.length === 0" style="margin: 1em;">No ebooks in this section.</p>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      sections: [],
      pendingRequests: [],
      searchQuery: '',
      searchBasis: 'name',
      error: null,
      isSearchClicked: false, // New data property to track if search button is clicked
    };
  },
  computed: {
    username() {
      return localStorage.getItem("username");
    },
    filteredSections() {
      if (this.isSearchClicked) { // Return filtered sections only if search button is clicked
        const query = this.searchQuery.toLowerCase();
        const basis = this.searchBasis.toLowerCase();
        return this.sections.filter(section => {
          // Filter ebooks within sections based on selected basis
          section.ebooks = section.ebooks.filter(ebook => {
            if (basis === 'section') {
              return section.name.toLowerCase().includes(query);
            } else if (basis === 'name') {
              return ebook.name.toLowerCase().includes(query);
            } else if (basis === 'author') {
              return ebook.author.toLowerCase().includes(query);
            }
          });
          return section.ebooks.length > 0;
        });
      } else {
        return this.sections; // Return all sections if search button is not clicked
      }
    }
  },

  created() {
    this.fetchSections();
    this.fetchPendingRequests(); // Fetch user's pending requests
  },
  methods: {
    fetchSections() {
      const token = localStorage.getItem("auth-token");
      axios
        .get("/api/sections", {
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
          data.forEach((section) => {
            section.ebooks.forEach((ebook) => {
              ebook.accessRequested = false;
            });
          });
          this.sections = data;
        })
        .catch((error) => {
          console.error("Error fetching sections:", error);
        });
    },
    fetchPendingRequests() {
      const token = localStorage.getItem("auth-token");
      axios
        .get("/api/pending-requests", {
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
          this.pendingRequests = data; // Store user's pending requests
          // Update accessRequested and accessGranted for ebooks with pending requests
          this.sections.forEach((section) => {
            section.ebooks.forEach((ebook) => {
              // Check if there's a pending request for the ebook
              const pendingRequest = this.pendingRequests.find(
                (request) => request.ebook_id === ebook.id
              );
              ebook.accessRequested = !!pendingRequest;
              ebook.accessGranted = pendingRequest ? pendingRequest.accessGranted : false;
            });
          });
        })
        .catch((error) => {
          console.error("Error fetching pending requests:", error);
        });
    },
    requestAccess(sectionId, ebook) {
      const token = localStorage.getItem("auth-token");
      axios
        .post(`/api/request-access/${ebook.id}`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log(response.data.message);
          ebook.accessRequested = true;
          console.log("Response:", response.data);
          this.fetchPendingRequests();
        })
        .catch((error) => {
          console.error("Error requesting access:", error);
        });
    },
    isRequestPending(ebook) {
      return this.pendingRequests.some(
        (request) => request.ebook_id === ebook.id
      );
    },
    showContent(ebook) {
      // Redirect to the page where the content of the accessed book should be shown
      this.$router.push({ name: 'ShowAccessedbooks', params: { ebookId: ebook.id } });
    },
    search() {
      // Triggered when the search button is clicked
      // Fetching data will happen only when the user clicks the search button
      this.isSearchClicked = true; // Set search clicked to true
      this.fetchSections();
      this.fetchPendingRequests();
    }
  },
};
