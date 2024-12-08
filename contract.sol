// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

error ErrorOwnerOnlyFunction();
error NoPlayers();
error TournamentDoesntExist();
error TournamentClosed();

contract SepoliaTournament {
    address public owner;

    struct Tournament {
        string[] players;
        uint256 id;
        Match[] matches;
    }

    struct Match {
        string Winner;
        string Loser;
        uint256 WinningScore;
        uint256 LosingScore;
    }

    uint256 nbrTournament = 0;
    mapping(uint256 => Tournament) private tournaments;

    event previewTournament(uint256 indexed tournamentId, string tournamentName, string[] players);

    event publishMatch(uint256 indexed tournamentId, uint256 indexed bracketId, string tournamentName, string Winner, string Loser, uint256 WinnerScore, uint256 LoserScore);

    event publishTournament(uint256 indexed tournamentId, string tournamentName, string[] players, string Winner);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner)
            revert ErrorOwnerOnlyFunction();
        _;
    }

    function createTournament(string[] memory _players, uint256 _tournamentId, string memory _tournamentName) public onlyOwner returns (uint256) {
        if (_players.length == 0)
            revert NoPlayers();
        Tournament storage newOne = tournaments[_tournamentId - 1];
        newOne.players = _players;
        newOne.id = _tournamentId;
        emit previewTournament(_tournamentId, _tournamentName, _players);
        nbrTournament ++;
        return newOne.id;
    }

    function addMatchToTournaments(string memory _player1, string memory _player2, string memory _tournamentName, uint256 _score1, uint256 _score2, uint256 _tournamentId, uint256 _bracketId) public onlyOwner {
        uint256 tId = _tournamentId - 1;
        Tournament storage tournament = tournaments[tId];
        Match memory newMatch = Match({
            Winner: _player1,
            Loser: _player2,
            WinningScore: _score1,
            LosingScore: _score2
        });

        tournament.matches.push(newMatch);
        emit publishMatch(_tournamentId, _bracketId, _tournamentName, _player1, _player2, _score1, _score2);
    }


    function closeTournament(uint256 _tournamentId, string memory _winner, string memory _tournamentName) public onlyOwner {
        uint256 tId = _tournamentId - 1;
        Tournament memory tournament = tournaments[tId];
        emit publishTournament(tId, _tournamentName, tournament.players, _winner);
    }
}
