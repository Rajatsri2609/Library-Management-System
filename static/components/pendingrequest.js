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
        const token = localStorage.getItem('auth-token');
        axios.get('/api/pending-requests', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(response => {
            this.pendingRequests = response.data.map(request => {
              return {
                ...request,
                accessButtonText: request.accessGranted ? 'Revoke Access' : 'Grant Access'
              };
            });
          })
          .catch(error => {
            console.error('Error fetching pending requests:', error);
            this.error = 'Error fetching pending requests';
          });
      },
      toggleAccess(request) {
        const token = localStorage.getItem('auth-token');
        const endpoint = request.accessGranted ? 'revoke-access' : 'grant-access';
        axios.post(`/api/${endpoint}/${request.id}`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(response => {
            if (endpoint === 'revoke-access') {
              // Remove the request from the pendingRequests array
              this.pendingRequests = this.pendingRequests.filter(req => req.id !== request.id);
            } else {
              // Update the accessGranted status in the list
              request.accessGranted = !request.accessGranted;
              // Update the accessButtonText
              request.accessButtonText = request.accessGranted ? 'Revoke Access' : 'Grant Access';
            }
            // Alert message
            //alert(`Access ${request.accessGranted ? 'granted' : 'revoked'} successfully`);
          })
          .catch(error => {
            console.error(`Error ${request.accessGranted ? 'revoking' : 'granting'} access:`, error);
            // Alert message for error
            alert(`Error ${request.accessGranted ? 'revoking' : 'granting'} access`);
          });
      }
    }      
  };
  