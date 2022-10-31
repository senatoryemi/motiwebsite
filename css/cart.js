(function(){
    var self = window.FC || {};
    var shop = $("#shop-template").html();
    var cart = $("#cart-template").html();
    var delivery = $("#delivery-template").html();
    self.templates = {
      shopTemplate : Handlebars.compile(shop),
      cartTemplate : Handlebars.compile(cart),
      deliveryTemplate : Handlebars.compile(delivery)
    }
    self.loadShop = function(){
      $.getJSON('https://dl.dropboxusercontent.com/u/48303043/data.json', function(data){
        console.log('Data loaded:', data);
        $('#content').html(self.templates.shopTemplate(data.message));
        self.shopLoaded();
      })
    };
    self.shopLoaded = function(){
      $('input').change(function(e){
        console.log('Update cart event',e);
        var val = parseInt(e.target.value);
        var ean = $(e.target).attr("data-ean"); 
        var price = $(e.target).attr("data-price"); 
        var name = $(e.target).attr("data-name");
        if(val > 10){
          $(e.target).val(10);
          return;
        }
        if(val <= 0){
          self.cart.remove({ean:ean})
          $('.' + ean + '-control').toggleClass('uk-hidden');
          return;
        }
        self.cart.update({name:name, ean:ean, count:val, price:price})
        console.log('Cart contents', self.cart);
      });  
      $('.cart-add-button').click(function(e){
          console.log('Update cart event',e);
          var ean = $(e.target).attr("data-ean");
          var price = $(e.target).attr("data-price");
          var name = $(e.target).attr("data-name"); 
          self.cart.update({name:name, ean:ean, count:1, price:price})
          $('#' + ean + '-count').val(1);
          console.log('Cart contents', self.cart);
      });
      $('.cart-remove-button').click(function(e){
          console.log('Update cart event',e);
          var ean = $(e.target).attr("data-ean"); 
          self.cart.remove({ean:ean})
          console.log('Cart contents', self.cart);
      });
    }
    self.cart = {
        items:{},
        update: function(params){
            var params = params || {};
            //TODO checking
            this.items[params.ean] = { name:params.name, count: params.count, amount: Math.round(params.count * params.price * 100) / 100 };
            this.render();
        },
        remove:function(params){
            var params = params || {};
            //TODO checking
            delete this.items[params.ean];
            this.render();
        },
        getData:function(){
          var data = {productCount:0,totalAmount:0}
          for (var item in this.items) {
            data.productCount = data.productCount + this.items[item].count;
            data.totalAmount = data.totalAmount + this.items[item].amount;
          }
          data.totalAmount = Math.round(data.totalAmount * 100) / 100;
          return data;
        },
        getBags:function(){
          var todo = [];
          var pending = [];
          var pendingSize = 0;
          var done = [];
          for (var item in this.items) {
              var line = this.items[item];
              line.ean = item;
              todo.push(line);
          }
          //order todos so we start with biggest count
          todo.sort(function(a,b){
              if(a.count == b.count)
                return 0;
              else
                return (a.count > b.count) ? -1 : 1;
          })
  
          while(todo.length > 0){
  
              //start a new bag
              pending.push(todo[0]);
              pendingSize = todo[0].count;
              //product now in bag
              todo.splice(0, 1);
              var baggeds = []
              //loop remaining products to fill the bag
              for (var i = 0; i < todo.length; i++) {
                if(pendingSize <= 10 && todo[i].count <= (10-pendingSize))
                {
                  //add product to bag
                  pending.push(todo[i]);
                  pendingSize = pendingSize + todo[i].count;
                  baggeds.push(i);
                }
              }   
              for (var i = baggeds.length - 1; i >= 0; i--) {
                  //product now in bag
                  todo.splice(baggeds[i], 1);
              }  
  
              //bag done
              done.push({bag:pending});
              pending = [];
              pendingSize = 0;
          }
  
          return done;
        },
        render:function(){
          $('#cart-holder').html(self.templates.cartTemplate(this.getData()));
          $('#delivery-button').click(function(){
            var bags = self.cart.getBags();
            $('#content').html(self.templates.deliveryTemplate({bags:bags, count:bags.length}));
            console.log('Bagging products to ' + bags.length + ' bags..', bags);  
          })
        }
    };
    self.loadShop();
  })();
  
  
  
  
  
  