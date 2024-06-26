export default {
    template:
    
  `<div class="limiter">
    <div class="container-login">
      <div class="wrap-login">
        <form class="login-form validate-form" @submit.prevent="register">
          <span class="login-form-title">Welcome</span>
          
          <div class="wrap-input validate-input">
            <input class="input" type="text" name="username" placeholder="Username" v-model="cred.username">
            <span class="focus-input" data-placeholder="Username"></span>
          </div>
          
          <div class="wrap-input validate-input" data-validate="Enter password" >
            <span class="btn-show-pass">
              <i class="zmdi zmdi-eye"></i>
            </span>
            <input class="input" type="password" name="password" placeholder="Password" v-model="cred.password">
            <span class="focus-input" data-placeholder="Password"></span>
          </div>
          
          <div class="wrap-input validate-input">
            <span class="btn-show-pass">
              <i class="zmdi zmdi-eye"></i>
            </span>
            <input class="input" type="text" name="name" placeholder="Name" v-model="cred.name">
            <span class="focus-input" data-placeholder="Name"></span>
          </div>
          <div>
          <input class="input" type="email" name="email" placeholder="Email" v-model="cred.email">
          <span class="focus-input" data-placeholder="Email"></span>
          </div>
          
          <div class="container-login-form-btn">
            <div class="wrap-login-form-btn">
              <button type="submit" class="login-form-btn">Sign up</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>`
  ,
 
    data() {
        return {
            cred: {
                username: null,
                password: null,
                name: null,
                email: null,
            },
            error: null,
        }
    },
    methods: {
        async register() {
          const formData = {
            username: this.cred.username,
            password: this.cred.password,
            name: this.cred.name,
            email:this.cred.email,
        };
        
          const res = await fetch('/register' , {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
      
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('auth-token', data.token);
            // Redirect the user to the home page or any other desired page
            this.$router.push({ path: '/login' });
          } else {
            errorData = await res.json();
            this.error = errorData.message;
          }
        },
      },
    }
      
// Create a style tag
const styleTag = document.createElement('style');

// Set the CSS content
styleTag.textContent = `
@import url('https://fonts.googleapis.com/css?family=Poppins&display=swap');

*
{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
body, html
{
    height: 100%;
    font-family: 'Poppins' sans-serif;
}
/*---------------------------------------------*/
input
{
    outline: none;
    border: none;
}
input:focus
{
    border-color: transparent !important;
}

input:focus::-webkit-input-placeholder
{
    color: transparent !important;
}
input::-webkit-input-placeholder
{
    color: #adadad;
}
/*---------------------------------------------*/
.limiter
{
    width: 100%;
    margin: 0 auto;
}
.container-login
{
    width: 100%;
    min-height: 100vh;
    display: flex;
    display: -webkit-box;
    display: -webkit-flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: 15px;
    background:rgb(247, 247, 247);
}
.wrap-login
{
    width: 400px;
    background: rgb(255,255,255);
    border-radius: 10px;
    overflow: hidden;
    padding: 80px 60px 80px 60px;
    box-shadow:0 35px 68px 0 rgb(136 174 222 / 42%),
    inset 0 -8px 16px 0 #b9d1f1;
}

/*------------------------------------------------------------------
[ Form ]*/

.login-form
{
    width: 100%;
}
.login-form-title
{
    display: block;
    font-family: 'Poppins';
    font-size: 30px;
    font-weight: bold;
    color: #000;
    line-height: 1.2;
    text-align: center;
    padding-bottom: 60px;
}
/*------------------------------------------------------------------
[ Input ]*/

.wrap-input
{
    width: 100%;
    position: relative;
    border-bottom: 2px solid #adadad;
    margin-bottom: 37px;
}
.input
{
    font-family: 'Poppins';
    font-size: 15px;
    color: #1f83f2;
    line-height: 1.2;
    display: block;
    width: 94%;
    height: 45px;
    background: transparent;
    padding: 0 5px;
    font-weight: bold;
}

/*---------------------------------------------*/ 
.focus-input
{
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    top:0;
    left: 0;
    pointer-events: none;
}
.focus-input:before
{
    content: "";
    position: absolute;
    display: block;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: #1f83f2;
    transition: all 0.4s;

}

.focus-input:after
{
    font-family: 'Poppins';
    font-size: 15px;
    color:#999999;
    line-height: 1.2;
    content: attr(data-placeholder);
    display: block;
    width: 100%;
    position:absolute;
    top: 16px;
    left: 0px;
    padding-left: 5px;
    transition: all 0.4s;
    -webkit-transition: all 0.4s;
}
.input:focus + .focus-input:after
{
    top: -15px;
}
.input:focus + .focus-input:before
{
    width: 100%;
}

.has-val.input + .focus-input::after
{
    top: -15px;
}
.has-val.input:focus + .focus-input:before
{
    width: 100%;
}


/*---------------------------------------------*/

.btn-show-pass
{
    font-size: 15px;
    color:#999999;
    display: -webkit-flex;
    display: -webkit-box;
    display: flex;
    align-items: center;
    position: absolute;
    height: 100%;
    top: 0;
    right: 0;
    padding-right: 5px;
    cursor: pointer;
    transition: all 0.4s;
}

.btn-show-pass:hover
{
    color:#1f83f2;
}

.btn-show-pass:active
{
    color:#1f83f2;
}
button
{
    outline: none !important;
    border:none;
    background: transparent;
}
.txt1
{
    font-family: 'Poppins';
    font-size: 13px;
    color: #666666;
    line-height: 1.5;
}
.txt2
{
    font-family: 'Poppins';
    font-size: 13px;
    color: #333333;
    line-height: 1.5;
    text-decoration: none;
    transition: all 0.4s;
}
.txt2:hover
{
    text-decoration: underline;
    color: #1f83f2;
}
/*------------------------------------------------------------------
[ Button ]*/
.container-login-form-btn
{
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding-top: 20px;
}
.wrap-login-form-btn
{
    width:100%;
    display:block;
    position: relative;
    z-index: 1;
    border-radius: 25px;
    overflow: hidden;
    margin: 0 auto;
    box-shadow: 5px 5px 7px #b9d1f1b0,
    inset 2px 2px 5px rgba(136, 174, 222, 0.09),
    inset -3px -3px 5px #b9d1f15e;

}
.login-form-btn
{
    font-family: 'Poppins';
    font-size: 15px;
    color: #1f83f2;
    line-height: 1.2;
    font-weight: bold;
    text-transform: uppercase;
    display: -webkit-flex;
    display: -webkit-box;
    display: flex;
    justify-content: center;
    align-items: center;
    letter-spacing: 1px;
    padding:0 20px;
    height: 50px;
    width:100%;
}

.login-form-btn:hover
{
    background: #1f83f2;
    color:#fff;
}
.login-form-btn:active
{
    background: #fd4520;
    color:#fff;
}
.text-center
{
    text-align: center;
    padding-top: 70px;
}

.validate-input
{
    position: relative;
}

.alert-validate:before
{
    content: attr(data-validate);
    position: absolute;
    max-width:70%;
    background-color: #fff;
    border-radius: 2px;
    border: 1px solid #ff0000;
    padding: 4px 25px 4px 10px;
    top: 50%;
    transform: translateY(-50%);
    right:0px;
    pointer-events: none;
    font-family: 'Poppins';
    color: #ff0000;
    font-size: 13px;
    line-height: 1.4;
    text-align: left;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.4s;

}

.alert-validate:after
{
    content: "\f1f8";
    font-family:material-design-iconic-font;
    font-size: 21px;
    color: #ff0000;
    position:absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 5px;
}

.alert-validate:hover:before
{
    visibility: visible;
    opacity: 1;

}

/*--Responsive-----*/

@media (max-width: 576px)
{
    .wrap-login
    {
        padding:77px 15px 33px 15px;
    }
}



@media (max-width: 992px){
.alert-validate:hover:before
{
    visibility: visible;
    opacity: 1;

}

}


<link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">   


`;

// Append the style tag to the document head
document.head.appendChild(styleTag);
