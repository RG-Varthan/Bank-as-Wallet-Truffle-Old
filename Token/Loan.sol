pragma solidity ^0.4.0;
import "./NewToken.sol";

contract Loan
{

    //Register contract functions
    struct bank_Details
    {
        string name;
        uint bal;
        uint time;
        uint loan_interst;
        uint fixed_deposit_interst;
        uint account_deposit_interst;
        uint token_count;
        uint borrow_amount;
        uint lend_amount;
    }
    
    mapping(address => bank_Details) public bank_d1;
    address[] public reg_user;

    
    function register(string name, uint loan_interst, uint fixed_deposit, uint acc_dep_int) public payable returns(string)
    {
        if(bank_d1[msg.sender].time == 0)
        {
            bank_d1[msg.sender].name = name;
            bank_d1[msg.sender].loan_interst = loan_interst;
            bank_d1[msg.sender].fixed_deposit_interst = fixed_deposit;
            bank_d1[msg.sender].account_deposit_interst = acc_dep_int;
            bank_d1[msg.sender].bal = msg.value;
            bank_d1[msg.sender].time = now;
        
            reg_user.push(msg.sender);
            return "Successfully Registered";
        }
        else
        {
            return "Account Alreay Exist";
        }
    }


    uint eth = 1 wei;
    
    struct loan_get
    {
        address bank_address;
        uint amount;
        uint count;
        uint last_setl_time;
        uint time;
        uint months;
        uint bal_ln;
        uint installment;
        uint tokens;
        uint year;
        address token_address;
        
    }
    
    mapping (address => mapping(uint256 => loan_get))public ln_get;
    mapping(address => uint256)public ln_get_count;
    
    struct loan_pro
    {
        address bank_address;
        uint256 amount;
        uint time;
        uint months;
        uint256 tokens;
    }
    
    mapping (address => mapping(uint256 => loan_pro))public ln_pro;
    mapping(address => uint256)public ln_pro_count;
    
    
    function req(address token_address,address bank_address,uint8 year,uint256 tokens)public //returns(uint256,uint256)
    {   
        uint256 amt = (eth * tokens);
        
        bank_d1[bank_address].bal -= amt;
        NewToken(token_address).transferFrom(msg.sender,bank_address,tokens);
        bank_d1[msg.sender].bal += amt;
       
        ln_get[msg.sender][ln_get_count[msg.sender]].year = year;
        ln_get[msg.sender][ln_get_count[msg.sender]].bank_address = bank_address;
        ln_get[msg.sender][ln_get_count[msg.sender]].amount = amt;
        ln_get[msg.sender][ln_get_count[msg.sender]].months = year*12;
        ln_get[msg.sender][ln_get_count[msg.sender]].time = now;
        ln_get[msg.sender][ln_get_count[msg.sender]].tokens = tokens;
        ln_get[msg.sender][ln_get_count[msg.sender]].last_setl_time = now;
        ln_get[msg.sender][ln_get_count[msg.sender]].installment = (amt)/(year*12);
        ln_get[msg.sender][ln_get_count[msg.sender]].bal_ln = amt;
        ln_get[msg.sender][ln_get_count[msg.sender]].token_address = token_address;
        
        bank_d1[msg.sender].token_count=tokens;
        
        ln_pro[bank_address][ln_pro_count[bank_address]].bank_address = msg.sender;
        ln_pro[bank_address][ln_pro_count[bank_address]].amount = amt;
        ln_pro[bank_address][ln_pro_count[bank_address]].months = year*12;
        ln_pro[bank_address][ln_pro_count[bank_address]].tokens = tokens;
        ln_pro[bank_address][ln_pro_count[bank_address]].time = now;
        
        ln_pro_count[bank_address]++;
        ln_get_count[msg.sender]++;
       
    }
    
    function balanceOftoken(address token) public view returns(uint)
    {
        return NewToken(token).balanceOf(msg.sender);
    }
    
    function settlement(uint ln_id) public
    {
        address temp_tokenaddress = ln_get[msg.sender][ln_id].token_address;
        uint temp_token = ln_get[msg.sender][ln_id].tokens;
        uint temp_count = ln_get[msg.sender][ln_id].count;
        uint temp_month = ln_get[msg.sender][ln_id].months;
        uint temp_bal_ln = ln_get[msg.sender][ln_id].bal_ln;
        uint temp_ins = ln_get[msg.sender][ln_id].installment;
        //uint temp_last = ln_get[msg.sender][ln_id].last_setl_time + 1 minutes;//30 days;
        address temp_bank_address = ln_get[msg.sender][ln_id].bank_address;
        
        require(temp_count < temp_month);
        //require(temp_last <= now);
        
        uint intr = bank_d1[temp_bank_address].loan_interst;
        uint amont = ( temp_bal_ln * (intr/100) ) /100;
        
        require(amont + temp_ins <= bank_d1[msg.sender].bal);
        
        bank_d1[msg.sender].bal -= amont+temp_ins;
        bank_d1[temp_bank_address].bal += amont+temp_ins;
        
        NewToken(temp_tokenaddress).transferFrom(temp_bank_address,msg.sender,temp_token);
       
        bank_d1[msg.sender].borrow_amount -= temp_ins;
        bank_d1[temp_bank_address].lend_amount -= temp_ins;
        
        //ln_get[msg.sender][ln_id].last_setl_time = temp_last ;//30 days;
        ln_get[msg.sender][ln_id].bal_ln -= temp_ins;
        ln_get[msg.sender][ln_id].count++;
    }
}
   