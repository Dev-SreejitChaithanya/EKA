const checkoutData = async (req, res) => {
    try {
      const user = await isLog(req.session.user);
      const address = await User.find({ email: req.session.user }).lean();
  
      const userCartData = await User.aggregate([
        { $match: { email: req.session.user } },
        {
          $lookup: {
            from: "products",
            let: { cartItems: "$cart" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$cartItems.productId"],
                  },
                },
              },
            ],
            as: "Products",
          },
        },
      ]);
      let subtotal = 0;
      userCartData[0].Products.map((item, i) => {
        item.quantity = req.body.quantity[i];
        subtotal = subtotal + item.price*req.body.quantity[i];
      });
      console.log(subtotal);
      res.render("checkout", {
        productDetails: userCartData[0].Products,
        subtotal: subtotal,
        userAddress: address[0].address,
  
      });
    } catch (error) {
      console.log(error);
    }
  };