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
import asyncio
import time


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
		"anonymous": "false",
		"inputs": [
			{
				"indexed": "true",
				"internalType": "uint256",
				"name": "tournamentId",
				"type": "uint256"
			},
			{
				"indexed": "false",
				"internalType": "string[]",
				"name": "players",
				"type": "string[]"
			}
		],
		"name": "previewTournament",
		"type": "event"
	},
	{
		"anonymous": "false",
		"inputs": [
			{
				"indexed": "true",
				"internalType": "uint256",
				"name": "tournamentId",
				"type": "uint256"
			},
			{
				"indexed": "true",
				"internalType": "uint256",
				"name": "bracketId",
				"type": "uint256"
			},
			{
				"indexed": "false",
				"internalType": "string",
				"name": "Winner",
				"type": "string"
			},
			{
				"indexed": "false",
				"internalType": "string",
				"name": "Loser",
				"type": "string"
			},
			{
				"indexed": "false",
				"internalType": "uint256",
				"name": "WinnerScore",
				"type": "uint256"
			},
			{
				"indexed": "false",
				"internalType": "uint256",
				"name": "LoserScore",
				"type": "uint256"
			}
		],
		"name": "publishMatch",
		"type": "event"
	},
	{
		"anonymous": "false",
		"inputs": [
			{
				"indexed": "true",
				"internalType": "uint256",
				"name": "tournamentId",
				"type": "uint256"
			},
			{
				"indexed": "false",
				"internalType": "string[]",
				"name": "players",
				"type": "string[]"
			},
			{
				"indexed": "false",
				"internalType": "string",
				"name": "Winner",
				"type": "string"
			}
		],
		"name": "publishTournament",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_player1",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_player2",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_score1",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_score2",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_tournamentId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_bracketId",
				"type": "uint256"
			}
		],
		"name": "addMatchToTournaments",
		"outputs": [],
		"stateMutability": "nonpayable",
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
				"name": "_winner",
				"type": "string"
			}
		],
		"name": "closeTournament",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string[]",
				"name": "_players",
				"type": "string[]"
			},
			{
				"internalType": "uint256",
				"name": "_tournamentId",
				"type": "uint256"
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

if (os.getenv('INFURA_SEPOLIA_API_KEY') and os.getenv('PRIVATE_KEY') and os.getenv('CONTRACT_ADDRESS')):

	#Connect to the Ethereum node
	sepolia_key = os.getenv('INFURA_SEPOLIA_API_KEY')
	private_key = os.getenv('PRIVATE_KEY')


	#Get contract address
	contractAddress = Web3.to_checksum_address(os.getenv('CONTRACT_ADDRESS'))


	#Get and connect metamask account
	web3 = Web3(Web3.HTTPProvider(sepolia_key))
	account = Account.from_key(private_key)


	web3.middleware_onion.inject(SignAndSendRawMiddlewareBuilder.build(account), layer=0)
	
	#Connect account to the contract

	admin_acc = account.address
	contract = web3.eth.contract(address=contractAddress, abi=abi)
else :
	print("Error : Missing environment variables for web3", file=sys.stderr)
	account = None
	admin_acc = None
	contract = None

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




def record_match(player1, score_1, player2, score_2, tournament_id, bracket_id):
	print("Recording match", file=sys.stderr)

	try :
		print(player1, type(player1), score_1, type(score_1), player2, type(player2), score_2, type(score_2), tournament_id, type(tournament_id), bracket_id, type(bracket_id), file=sys.stderr)
		token_hash = contract.functions.addMatchToTournaments(player1, player2, score_1, score_2, tournament_id, bracket_id).transact({'from' : admin_acc})
		print("Token hash : ", token_hash, file=sys.stderr)
		receipt = web3.eth.wait_for_transaction_receipt(token_hash)
		if (receipt.status == 1):
			print("Match enregistre avec succes", file=sys.stderr)
			print_etherscan_link(token_hash)
		else:
			print("Error lors de l'enregistrement du match", file=sys.stderr)
	except Exception as e:
		error = "Error recording match, type of error :\n" + f"{type(e).__name__}\n" + f"Error message :\n {str(e)}\n" + "\n Traceback : \n" + traceback.format_exc()
		logger.error(error)
	return None

def return_etherscan_link(token_hash):
	return "https://sepolia.etherscan.io/tx/0x" + token_hash.hex()

def print_etherscan_link(token_hash):
	printer = "https://sepolia.etherscan.io/tx/0x" + token_hash.hex()
	print("Voici le lien vers la transaction : " + printer, file=sys.stderr)

def get_tournament_id():
	try:
		tournament_id = contract.functions.getTournamentId().call()
		logger.info(f"Tournament id retrieved successfully \nID : {tournament_id}")
	except Exception as e:
		error = "Error getting tournament id, type of error :\n" + f"{type(e).__name__}\n" + f"Error message :\n {str(e)}\n" + "\n Traceback : \n" + traceback.format_exc()
		logger.error(error)
		return None

def get_participants_arr(tournament):
	players_array = []

	for participant in tournament.participants.all():
		players_array.append((participant.username))

	print("!!!!!!!!!!!!!!!!!!!!Players array : ", players_array, file=sys.stderr)
	return players_array

def createTournament(players_arr, tournament_id):
	test(players_arr)
	print(players_arr, type(players_arr), file=sys.stderr)
	print(tournament_id, type(tournament_id), file=sys.stderr)
	for player in players_arr:
		print("ALED", player, type(player), file=sys.stderr)
	try:
		token_hash = contract.functions.createTournament(players_arr, tournament_id).transact({'from' : admin_acc})
		print(token_hash, file=sys.stderr)
		receipt = web3.eth.wait_for_transaction_receipt(token_hash)
		if (receipt.status == 1):
			print("Tournament created successfully", file=sys.stderr)
			print_etherscan_link(token_hash)
		else:
			print("Error creating tournament", file=sys.stderr)
			return ""
	except Exception as e:
		error = "Error creating tournament, type of error : " + f"{type(e).__name__}\n" + f"Error message :\n {str(e)}\n"  + "\n Traceback : \n" + traceback.format_exc()
		print(error, file=sys.stderr)
		return ""

def closeTournament(tournament_id, winner):
	print(tournament_id, type(tournament_id), file=sys.stderr)
	print("WINNER", winner, type(winner), file=sys.stderr)
	try:
		token_hash = contract.functions.closeTournament(tournament_id, winner).transact({'from' : admin_acc})
		receipt = web3.eth.wait_for_transaction_receipt(token_hash)
		if (receipt.status == 1):
			print("Tournament closed successfully", file=sys.stderr)
			print_etherscan_link(token_hash)
			return return_etherscan_link(token_hash)
		else:
			print("Error closing tournament", file=sys.stderr)
	except Exception as e:
		error = "Error closing tournament, type of error : " + f"{type(e).__name__}\n" + f"Error message :\n {str(e)}\n"  + "\n Traceback : \n" + traceback.format_exc()
		print(error, file=sys.stderr)
		return None