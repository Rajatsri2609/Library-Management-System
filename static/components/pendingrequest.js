export default {
    template: `
    <div>
    <h1>Pending Requests</h1>
    <table class="table">
      <thead>
        <tr>
          <th>Request ID</th>
          <th>User ID</th>
          <th>Ebook ID</th>
          <th>Request Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in pendingRequests" :key="request.id">
          <td>{{ request.id }}</td>
          <td>{{ request.user_id }}</td>
          <td>{{ request.ebook_id }}</td>
          <td>{{ request.request_date }}</td>
          <td>
            <button @click="toggleAccess(request)" :class="{'btn btn-success': !request.accessGranted, 'btn btn-danger': request.accessGranted}">
              {{ request.accessButtonText }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
    `,
    data() {
      return {
        pendingRequests: [],
        error: null
      };
    },
    created() {
      this.fetchPendingRequests();
    },
    methods: {
      fetchPendingRequests() {
          const token = localStorage.getItem('auth-token'); // Retrieve the token from local storage
          if (!token) {
            console.error('Token is missing'); // Handle the case when token is missing
            return;
          }
        fetch('/api/pending-requests', {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the Authorization header
          }
        })
        .then(response => response.json())
        .then(data => {
          this.pendingRequests = data;
        })
        .catch(error => {
          console.error('Error fetching pending requests:', error);
          this.error = 'Error fetching pending requests';
        });
      },
      toggleAccess(request) {
        const token = localStorage.getItem('auth-token');
        const endpoint = request.accessGranted ? 'revoke-access' : 'grant-access';
        fetch(`/api/${endpoint}/${request.id}`, {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${token}` // Include the token in the Authorization header
          }
        })
        .then(response => response.json())
        .then(data => {
          if (endpoint === 'revoke-access') {
            this.pendingRequests = this.pendingRequests.filter(req => req.id !== request.id);
          } else {
            request.accessGranted = !request.accessGranted;
            request.accessButtonText = request.accessGranted ? 'Revoke Access' : 'Grant Access';
          }
        })
        .catch(error => {
          console.error(`Error ${request.accessGranted ? 'revoking' : 'granting'} access:`, error);
          alert(`Error ${request.accessGranted ? 'revoking' : 'granting'} access`);
        });
      }
    }
  };
  