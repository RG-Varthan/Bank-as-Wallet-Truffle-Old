// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import bank_artifacts from '../../build/contracts/Bank.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Bank = contract(bank_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Bank.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.basicfunctions();
      self.bank_list();
      self.loan_list();
      self.get_loan_list();
      self.fix_bank_list();
      self.fix_user_list();
    });
    this.showBalance();

  $("#deposit-bank").click(function(event) {

    var self = this;

    var deposit_amount = parseInt(document.getElementById("deposit-amount").value);

    $("#status").html("Initiating transaction... (please wait)");

    Bank.deployed().then(function(instance) {
      console.log(web3.toWei(deposit_amount, 'ether'));
      return instance.deposit({from: account, gas: 6000000, value: web3.toWei(deposit_amount, 'ether')});
    }).then(function() {
      $("#status").html("Transaction complete!");
      App.showBalance();
    }).catch(function(e) {
      console.log(e);
      $("#status").html("Error in transaction; see log.");
    });
  });

  $("#withdraw-bank").click(function(event) {

    var self = this;

    var withdraw_amount = parseInt(document.getElementById("withdraw-amount").value);

    $("#status").html("Initiating transaction... (please wait)");

    Bank.deployed().then(function(instance) {
      console.log(web3.toWei(withdraw_amount, 'ether'));
      return instance.withdraw(web3.toWei(withdraw_amount, 'ether'),{from: account, gas: 6000000, });
    }).then(function() {
      $("#status").html("Transaction complete!");
      App.showBalance();
    }).catch(function(e) {
      console.log(e);
      $("#status").html("Error in transaction; see log.");
    });
  });

  $("#register-bank").click(function(event) {

    var self = this;

    var interest = parseInt((document.getElementById("interest").value) * 100);
    var loan_interest = parseInt((document.getElementById("loan-interest").value) * 100);
    var deposit_interest = parseInt((document.getElementById("deposit-interest").value) * 100);
    var bank_name = document.getElementById("bank-name").value;

    $("#status").html("Initiating transaction... (please wait)");

    Bank.deployed().then(function(instance) {
      return instance.register(bank_name, loan_interest, deposit_interest, interest, {from: account, gas: 6000000});
    }).then(function() {
      $("#status").html("Transaction complete!");
      App.showBalance();
    }).catch(function(e) {
      console.log(e);
      $("#status").html("Error in transaction; see log.");
    });
  });
  },

  basicfunctions : function(){
    $("#account").val(account)
    
    web3.eth.getBalance(account, (err, balance) => {
      balance = web3.fromWei(balance, "ether") + " Ξ"
      $("#balance").val(balance.trim())
    });
  },

  showBalance: function() {
    var self = this;

    var bank;
    
    Bank.deployed().then(function(instance) {
      bank = instance;
      return instance.isRegistered(account);
    }).then(function(val) {
      console.log(val);
      if (val == true) {
        $("#reg_bank").html('');
        $("#bank-info").html("This bank has registered");
      } else {
        $("#bank-info").html("This bank has not registered yet");
      }
      return bank.fetchBalance(account);
    }).then(function(val) {
      $("#balance-address").html("This bank's balance is " + web3.fromWei(val, "ether") + " Ξ");
    }).catch(function(e) {
      console.log(e);
    });
  },
  
  bank_list : function(){
    var self = this;

    var bank;

    $("#bank_list").html('');
    $("#bank_list").append('<table class="table table-striped"><thead><tr><th>Bank Address</th><th>Bank Name</th><th>Balance</th><th>Borrow Amount</th><th>Lend Amount</th><th>Loan Int.</th><th>Fixed Int.</th><th>Deposite Int.</th></tr></thead><tbody id="body_bank"></tbody></table>');
    
    Bank.deployed().then(function(instance) {
      bank = instance;
      return instance.show_registers();
    }).then(function(val) {
       $.each(val,function(err,data){
        bank.bank_d1(data).then(function(result){
          $("#body_bank").append('<tr><td>'+data+'</td><td>'+result[0]+'</td><td>'+web3.fromWei(result[1].toNumber(), "ether")+" Ξ"+'</td><td>'+web3.fromWei(result[7].toNumber(), "ether")+" Ξ"+'</td><td>'+web3.fromWei(result[8].toNumber(), "ether")+" Ξ"+'</td><td>'+(result[3]/100)+" %"+'</td><td>'+(result[4]/100)+" %"+'</td><td>'+(result[5]/100)+" %"+'</td></tr>')
        })
       })
      
    });
  },
  
get_loan : function(){
  var loan_amount  = parseInt($("#loan-amount").val().trim());
  var loan_address = $("#loan-address").val().trim();
  var loan_time = parseInt($("#loan-time").val().trim());

  $("#loan-status").html("Initiating transaction... (please wait)");
  
  var self = this;
  var bank;
  Bank.deployed().then(function(instance) {
    bank = instance;
    return bank.req_loan(loan_address, web3.toWei(loan_amount, 'ether'),loan_time,{from:account,gas: 6000000});
  }).then(function(val) {
    $("#loan-status").html("Transaction complete!");
  }).catch(function(e) {
    console.log(e);
    $("#loan-status").html("Error in transaction; see log.");
  });
},


loan_list:function(){
  var self = this;
  var bank;
  $("#loan_list").html('')
  Bank.deployed().then(function(instance) {
    bank = instance;
    return bank.ln_pro_count(account);
  }).then(function(val) {
      for(var i=0;i<val.toNumber();i++){
        bank.ln_pro(account,i).then(function(data,err){
          $("#loan_list").append('<tr><td>'+data[0]+'</td><td>'+web3.fromWei(data[1].toNumber(), "ether")+ " Ξ"+'</td><td>'+data[3]+'</td></tr>');
        });
      }
  });
},

get_loan_list:function(){
  var self = this;
  var bank;
  $("#get_loan_list").html('')
  Bank.deployed().then(function(instance) {
    bank = instance;
    return bank.ln_get_count(account);
  }).then(function(val) {
      for(var i=0;i<val.toNumber();i++){
        bank.ln_get(account,i).then(function(data,err){
          var myDate = new Date( (data[3].toNumber()) *1000);
          var a=(myDate.toLocaleString());
          //console.log( a.split(',')[0] );

          $("#get_loan_list").append('<tr><td>'+data[8]+'</td><td>'+data[0]+'</td><td>'+web3.fromWei(data[1].toNumber(), "ether")+ " Ξ"+'</td><td>'+data[2]+'</td><td>'+a.split(',')[0]+'</td><td>'+data[5]+'</td><td>'+web3.fromWei(data[6].toNumber(), "ether")+ " Ξ"+'</td><td>'+web3.fromWei(data[7].toNumber(), "ether")+ " Ξ"+'</td></tr>');
        });
      }
  });
},



fix_dep : function(){
  var dep_amount  = parseInt($("#fix-dep-amount").val().trim());
  var bnk_address = $("#bnk-address").val().trim();
  var dep_time = parseInt($("#fix-dep-time").val().trim());

  $("#fix-status").html("Initiating transaction... (please wait)");
  
  var self = this;
  var bank;
  Bank.deployed().then(function(instance) {
    bank = instance;
    return bank.Fixed_Deposit(bnk_address,dep_time,{from:account,gas: 6000000,value: web3.toWei(dep_amount, 'ether')});
  }).then(function(val) {
    $("#fix-status").html("Transaction complete!");
  }).catch(function(e) {
    console.log(e);
    $("#fix-status").html("Error in transaction; see log.");
  });
},



fix_user_list:function(){
  var self = this;
  var bank;
  $("#fix_user_list").html('')
  Bank.deployed().then(function(instance) {
    bank = instance;
    return bank.bank_client_count(account);
  }).then(function(val) {
      for(var i=0;i<val.toNumber();i++)
      {
        bank.bank_owner_clients(account,i).then(function(valu,err){
          bank.bank_client_Details(account,valu).then(function(data,err){
            var myDate = new Date( (data[4].toNumber()) *1000);
            var a=(myDate.toLocaleString());
            var stus;
            if(data[6])
            {
              stus="Not Settled";
              $("#fix_user_list").append('<tr><td>'+data[1]+'</td><td>'+web3.fromWei(data[2].toNumber(), "ether")+ " Ξ"+'</td><td>'+a.split(',')[0]+'</td><td>'+stus+'</td>');
            }
          });
        });
      }
  });
},

fix_bank_list:function(){
  var self = this;
  var bank;
  $("#fix_bank_list").html('')
  Bank.deployed().then(function(instance) {
    bank = instance;
    return bank.my_acc_count(account);
  }).then(function(val) {
      for(var i=0;i<val.toNumber();i++){
        bank.my_acc_details(account,i).then(function(valu,err){
          bank.bank_client_Details(valu,account).then(function(data,err){
            var myDate = new Date( (data[4].toNumber()) *1000);
            var a=(myDate.toLocaleString());
            var stus;
            if(data[6])
            {
              stus="Not Settled"
              $("#fix_bank_list").append('<tr><td>'+data[0]+'</td><td>'+web3.fromWei(data[2].toNumber(), "ether")+ " Ξ"+'</td><td>'+a.split(',')[0]+'</td><td>'+data[5]+'</td><td>'+stus+'</td>');
            }
          });
        });
      }
  });
},



pay_due:function(){
  var id = parseInt($("#Loan_id").val().trim());
  var self = this;
  var bank;
  $("#status").html("Initiating transaction... (please wait)");
  Bank.deployed().then(function(instance) {
    bank = instance;
    return bank.settlement(id,{from:account,gas: 6000000});
  }).then(function() {
    $("#status").html("Transaction complete!");
  }).catch(function(e) {
    console.log(e);
    $("#status").html("Error in transaction; see log.");
  });
},

fix_req:function(){
  var bank_addr = $("#bank-fix-address").val().trim();
  var self = this;
  var bank;
  $("#fix-req-status").html("Initiating transaction... (please wait)");
  Bank.deployed().then(function(instance) {
    bank = instance;
    return bank.fixed_amount_get(bank_addr,{from:account,gas: 6000000});
  }).then(function() {
    $("#fix-req-status").html("Transaction complete!");
  }).catch(function(e) {
    console.log(e);
    $("#fix-req-status").html("Error in transaction; see log.");
  });
},


fix_set:function(){
  var user_addr = $("#user-fix-address").val().trim();
  var self = this;
  var bank;
  $("#fix-set-status").html("Initiating transaction... (please wait)");
  Bank.deployed().then(function(instance) {
    bank = instance;
    return bank.amount_settlement(user_addr,{from:account,gas: 6000000});
  }).then(function() {
    $("#fix-set-status").html("Transaction complete!");
  }).catch(function(e) {
    console.log(e);
    $("#fix-set-status").html("Error in transaction; see log.");
  });
}

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});