import os
from web3 import Web3
from eth_account import Account
from web3.middleware import construct_sign_and_send_raw_middleware
from logging import getLogger


#ABI
const abi =
[
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "loser",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "winner",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "score",
				"type": "string"
			}
		],
		"name": "saveMatch",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "Owner",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "players",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "winner",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string[96]",
				"name": "matches",
				"type": "string[96]"
			}
		],
		"name": "saveTournament",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_loser",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_winner",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_score",
				"type": "string"
			}
		],
		"name": "sendMatch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_tournamentOwner",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_players",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_winner",
				"type": "string"
			},
			{
				"internalType": "string[96]",
				"name": "_matches",
				"type": "string[96]"
			}
		],
		"name": "sendTournament",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

#Logs
logger = getLogger(__name__)

#Connect to the Ethereum node
sepolia_key = os.getenv('INFURA_SEPOLIA_API_KEY')
private_key = os.getenv('PRIVATE_KEY')
#Get contract address
const contractAddress = os.getenv('CONTRACT_ADDRESS')
#Get and connect metamask account
const web3 = new Web3(Web3.HTTPProvider(private_key))
account = Account.from_key(private_key)

#Add middleware (sign and send raw transaction)
web3.middleware_onion.add(construct_sign_and_send_raw_middleware(private_key))

#Connect account to the contract
admin_acc = account.address
contract = web3.eth.contract(address=contract_address, abi=contract_abi)


#Record match on the blockchain
def record_match(winner, loser, w_score, l_score, match_id):
	try :
		token_hash = contract.functions.sendMatch(match_id, ).transact(admin_acc)
		receipt = web3.eth.waitForTransactionReceipt(token_hash)
		if (receipt.status == 1):
			logger.info("Match recorded successfully")
			print_etherscan_link(token_hash)
		else:
			logger.error("Error recording match")
	except Exception as e:
		error = "Error recording match, type of error :\n" + f"{type(e).__name__}\n" + f"Error message :\n {str(e)}\n" + "\n Traceback : \n" traceback.format.exc()
		logger.error(error)
			
	
def print_etherscan_link(token_hash):
	printer = "https://sepolia.etherscan.io/tx/" + token_hash.hex()
	logger.info("Voici le lien vers la transaction : " + printer)


def get_tournament_id():
	try:
		tournament_id = contract.functions.getTournamentId().call()
		logger.info(f"Tournament id retrieved successfully \nID : {tournament_id}")
	except Exception as e:
		error = "Error getting tournament id, type of error :\n" + f"{type(e).__name__}\n" + f"Error message :\n {str(e)}\n" + "\n Traceback : \n" traceback.format.exc()
		logger.error(error)
		return None