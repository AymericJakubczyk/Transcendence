import os
import sys
from django.http import JsonResponse
from eth_account import Account
from web3 import Web3
from web3.middleware import construct_sign_and_send_raw_middleware
from logging import getLogger


#ABI
abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "ErrorOwnerOnlyFunction",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NoPlayers",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "TournamentDoesntExist",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string[]",
				"name": "_players",
				"type": "string[]"
			}
		],
		"name": "createTournament",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_tournamentId",
				"type": "uint256"
			}
		],
		"name": "getMatches",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "player1",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "player1_score",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "player2",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "player2_score",
						"type": "uint256"
					}
				],
				"internalType": "struct SepoliaTournament.Match[]",
				"name": "matches",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_tournamentId",
				"type": "uint256"
			}
		],
		"name": "getPlayers",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "players",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_tournamentId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "player",
				"type": "string"
			}
		],
		"name": "isInTournament",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

#Logs
logger = getLogger(__name__)

#Connect to the Ethereum node

sepolia_key = os.getenv('INFURA_SEPOLIA_API_KEY')
private_key = os.getenv('PRIVATE_KEY')

#Get contract address

contractAddress = os.getenv('CONTRACT_ADDRESS')

#Get and connect metamask account


web3 = Web3(Web3.HTTPProvider(sepolia_key))
account = Account.from_key(private_key)

if (web3.isConnected()):
	logger.info("Connected to the Ethereum node")
else:
	logger.error("Error connecting to the Ethereum node")

print("testa", file=sys.stderr)

#Add middleware (sign and send raw transaction)

web3.middleware_onion.add(construct_sign_and_send_raw_middleware(account))

# web3.middleware_onion.add(construct_sign_and_send_raw_middleware(private_key))

#Connect account to the contract

admin_acc = account.address
contract = web3.eth.contract(address=contractAddress, abi=abi)
	

if (contract):
	logger.info("Connected to the contract")
else:
	logger.error("Error connecting to the contract")

#Record match on the blockchain

def test(request):
	print("testbb", file=sys.stderr)
	# players = ["player1", "player2"]
	if (web3.isConnected()):
		logger.error("Connected to the Ethereum node")
	else:
		logger.error("Error connecting to the Ethereum node")
	if (contract):
		logger.error("Connected to the contract")
	else:
		logger.error("Error connecting to the contract")
	return JsonResponse({"message": "test"})
		

def record_match(player1, score_1, player2, score_2):
	try :
		token_hash = contract.functions.sendMatch(match_id).transact(admin_acc)
		receipt = web3.eth.waitForTransactionReceipt(token_hash)
		if (receipt.status == 1):
			logger.info("Match recorded successfully")
			print_etherscan_link(token_hash)
		else:
			logger.error("Error recording match")
	except Exception as e:
		error = "Error recording match, type of error :\n" + f"{type(e).__name__}\n" + f"Error message :\n {str(e)}\n" + "\n Traceback : \n" + traceback.format.exc()
		logger.error(error)
			
	
def print_etherscan_link(token_hash):
	printer = "https://sepolia.etherscan.io/tx/" + token_hash.hex()
	logger.info("Voici le lien vers la transaction : " + printer)


def get_tournament_id():
	try:
		tournament_id = contract.functions.getTournamentId().call()
		logger.info(f"Tournament id retrieved successfully \nID : {tournament_id}")
	except Exception as e:
		error = "Error getting tournament id, type of error :\n" + f"{type(e).__name__}\n" + f"Error message :\n {str(e)}\n" + "\n Traceback : \n" + traceback.format.exc()
		logger.error(error)
		return None