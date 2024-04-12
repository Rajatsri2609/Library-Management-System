
export default {
  template: `
  <div>
    <h1>Welcome Librarian</h1>
    <div class="heading">
      <h2 class='text-muted' style="margin-left: 150px;">Section</h2>
      <router-link to="/add-section" class='btn btn-success' style="margin-right: 150px;">
        <i class="fas fa-plus fa-xs"></i>
        Add
      </router-link>
    </div>
    <div style="max-width: 1000px; margin: 20px auto; border: 1px solid #ccc;">
      <table class="table">
        <thead>
          <tr>
            <th>Section Id</th>
            <th>Section Name</th>
            <th>Number of eBooks</th>
            <th>Description</th>
            <th>Actions</th> 
          </tr>
        </thead>
        <tbody>
          <tr v-for="section in sections" :key="section.id">
            <td>{{ section.id }}</td>
            <td>{{ section.name }}</td>
            <td>{{ section.num_ebooks }}</td>
            <td>{{ section.description }}</td>
            <td>
              <router-link :to="{ name: 'EditSection', params: { id: section.id }}" class="btn btn-primary">
                <i class="fas fa-edit fa-xs"></i>
                Edit
              </router-link>
              <button @click="confirmDelete(section.id, section.name)" class="btn btn-danger">
                <i class="fas fa-trash fa-xs"></i>
                Delete
              </button>
              <router-link :to="{ name: 'ShowEBooks', params: { sectionId: section.id }}" class="btn btn-success">
                <i class="fas fa-search"></i>
                  Show Ebooks
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button @click="viewPendingRequests" class='btn btn-info'>
        Pending Requests
    </button>
  </div>
  `,
  data() {
    return {
      sections: [],
      error: null
    };
  },
  created() {
    this.fetchSections();
  },
  methods: {
    fetchSections() {
      const token = localStorage.getItem('auth-token');
      axios.get('/api/sections', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(response => {
          this.sections = response.data;
        })
        .catch(error => {
          console.error('Error fetching sections:', error);
          this.error = 'Error fetching sections';
        });
    },
    confirmDelete(sectionId, sectionName) {
      this.$router.push({ name: 'Deleteconformation', params: { sectionId, sectionName } });
    },
    viewPendingRequests() {
      this.$router.push({ name: 'pendingrequest' });
    }

  }
};

const styleTag = document.createElement('style');

// Set the CSS content
styleTag.textContent = `
  .heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  h1, h2 {
    text-align: center;
  }
  body{
    text-align: center;
  }

`;

// Append styleTag to the document's head
document.head.appendChild(styleTag);
