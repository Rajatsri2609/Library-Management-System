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
              <template v-if="!request.accessGranted">
                <button @click="toggleAccess(request, 'grant')" class="btn btn-success">Grant Access</button>
              </template>
              <template v-else>
                <button @click="toggleAccess(request, 'revoke')" class="btn btn-danger">Revoke Access</button>
              </template>
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
      const token = localStorage.getItem('auth-token');
      if (!token) {
        console.error('Token is missing');
        return;
      }
      fetch('/api/pending-requests', {
        headers: {
          Authorization: `Bearer ${token}`
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
    toggleAccess(request, action) {
      const token = localStorage.getItem('auth-token');
      let endpoint = '';
      if (action === 'grant') {
        endpoint = request.accessGranted ? 'revoke-access' : 'grant-access';
      } else if (action === 'revoke') {
        endpoint = 'revoke-access';
      }
      fetch(`/api/${endpoint}/${request.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Network response was not ok.');
        }
      })
      .then(data => {
        if (action === 'grant') {
          request.accessGranted = true;
        } else if (action === 'revoke') {
          this.pendingRequests = this.pendingRequests.filter(req => req.id !== request.id);
        }
      })
      .catch(error => {
        console.error(`Error ${action === 'grant' ? 'revoking' : 'granting'} access:`, error);
        alert(`Error ${action === 'grant' ? 'revoking' : 'granting'} access`);
      });
    },
  }
};
