export default{
    template : `
    <div class="gp">
      <div class="container-fluid p-3">
        <form>
          <div class="parent">
            <div>
              <select name="basis" id="basis" class="form-select">
                <option value="name" >Section</option>
               
      
              </select>
            </div>
          <div style="display: flex;gap: 2em;">
            <div>
              <input type="text" class="form-control" id="search" name="search" placeholder="Search">

            </div>
            <div>
              <button type="submit" class="btn btn-outline-primary"> Search</button>
            </div>
            
            
          </button>
          </div>       
          
          </div>
        </form>
      </div>
      <div style="font-weight: 800; font-size: 1.5em; margin-top: 5px;">
        <center>Hello {{user.name}}!</center>

      </div>
      
  
    <div style="display: flex; flex-direction: column; align-items: center;padding: 4em;" class="categories-list">
      
        {% for category in categories if not category.is_deleted %}
          <div class="category" style="width: 100%; margin: 32px 0;">
            <h3>{{category.name}}</h3>
            <div class="product-list" style="display: flex; flex-wrap: wrap; ">
              {% if category.products %}
              
                {% for product in category.products %}
                 {% if not product.is_deleted %}
                  {% if (price and product.price <= price) or (name and name.lower() in product.name.lower()) or (not price and not name) %}
                    <div class="product" style="width: 300px;margin: 16px; padding: 16px; border: 1px solid #ccc; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-direction: column;">
                      <div class="product-description" style="display: flex; flex-direction: column; align-items: flex-start;">
                        <h4 style="margin: 0;">{{product.name}}</h4>
                        <p style="margin: 0;">&#8377;{{product.price}}</p>
                        <p >Available: {{product.quantity}}</p>
                      </div>
                      
                      {% if product.quantity >0 %}
                      
                      <div class="add_to_cart" style="display: flex; flex-direction: column; align-items: center;">
                      
                        <form action="{{url_for('add_to_cart' , product_id=product.id)}}" class="product_quantity" style="display: flex;align-items: center;gap: 2px;" method="post">
                          <label for="quantity" style="margin-right: 8px;"> Quantity :</label>
                          <input type="number" style="width: 50px;text-align: center;" name="quantity" id="quantity" value="1" min="1" max="{{product.quantity}}">
                          <button type="submit" style="border: none;border-radius: 5px; background-color: green; ">
                            Add to Cart
                          </button>
                       
          
      
                        </form>
                      </div>
                      {% else %}
                      <button class="btn" style="border: none; border-radius: 3px;background-color: red; color:aliceblue;" disabled>
                        Out of stock
                      </button>
                      {% endif %}
                    </div>
                  {% endif %}
                 {% endif %} 
                {% endfor %}
              {% else %}
                <p> No products in this category.</p>  
              {% endif %}  
            </div>
          </a>
          </div>
        
        {% endfor %}  
    </div>    
      
    </div>`
}