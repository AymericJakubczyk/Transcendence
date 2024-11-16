import os
import sys
import traceback
from django.http import JsonResponse
from eth_account import Account
from web3 import Web3
# from web3.middleware import SignAndSendR
from web3.middleware import SignAndSendRawMiddlewareBuilder
from web3 import middleware
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

#Add middleware (sign and send raw transaction)

web3.middleware_onion.inject(SignAndSendRawMiddlewareBuilder.build(account), layer=0)

# web3.middleware_onion.add(construct_sign_and_send_raw_middleware(private_key))

#Connect account to the contract

admin_acc = account.address
contract = web3.eth.contract(address=contractAddress, abi=abi)


#Record match on the blockchain

def test(request):
	# players = ["player1", "player2"]
	if (web3.is_connected()):
		print("Connected to the Ethereum node", file=sys.stderr)
	else:
		print("Error connecting to the Ethereum node", file=sys.stderr)
	if (contract):
		print("Connected to the contract", file=sys.stderr)
	else:
		print("Error connecting to the contract", file=sys.stderr)
	print(account, "ACC", admin_acc, file=sys.stderr)
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

def get_participants_arr(tournament):
	players_array = []

	for participant in tournament.participants.all():
		players_array.append((participant.username))

	print("!!!!!!!!!!!!!!!!!!!!Players array : ", players_array, file=sys.stderr)
	return players_array




def createTournament(players_arr):
	test(players_arr)
	print("|||||||||||||||||||||||||||||||Creating tournament|||||||||||||||||||||||||||||||", file=sys.stderr)
	print(players_arr, type(players_arr), file=sys.stderr)
	for player in players_arr:
		print("ALED", player, type(player), file=sys.stderr)
	try:
		# data = contract.encodeABI(fn_name='createTournament', args=[player_arr])
		# print(f"Encoded data: {data}")
		
		tournament_id = contract.functions.createTournament(players_arr).transact({'from' : admin_acc})
		# tournament_id = contract.functions.createTournament().buildTransaction({
		# 'from': account,
		# 'gas': 2000000,  # Set appropriate gas limit
		# 'gasPrice': w3.toWei('20', 'gwei'),  # Set appropriate gas price
		# 'nonce': w3.eth.getTransactionCount(account),
		# })
		print(tournament_id, file=sys.stderr)
		receipt = web3.eth.wait_for_transaction_receipt(tournament_id)
		if (receipt.status == 1):
			print("Tournament created successfully", file=sys.stderr)
			print_etherscan_link(tournament_id)
		else:
			print("Error creating tournament", file=sys.stderr)
	except Exception as e:
		error = "Error creating tournament, type of error : " + f"{type(e).__name__}\n" + f"Error message :\n {str(e)}\n"  + "\n Traceback : \n" + traceback.format_exc()
		print(error, file=sys.stderr)
		return None
