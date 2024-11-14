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
        bool status; // True:False / Open:Closed
        uint256 id;
        Match[] matches;
    }

    struct Match {
        string player1;
        uint256 player1_score;
        string player2;
        uint256 player2_score;
    }

    uint256 nbrTournament;
    mapping(uint256 => Tournament) private tournaments;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner)
            revert ErrorOwnerOnlyFunction();
        _;
    }

    function createTournament(string[] memory _players) public onlyOwner returns (uint256) {
        if (_players.length == 0)
            revert NoPlayers();
        Tournament storage newOne = tournaments[nbrTournament];
        newOne.players = _players;
        newOne.id = nbrTournament;
        newOne.status = true;
        nbrTournament++;
        return nbrTournament - 1;
    }

    function isInTournament(uint256 _tournamentId, string memory player) public view returns (bool) {
        if (_tournamentId >= nbrTournament)
            revert TournamentDoesntExist();
        Tournament storage tournament = tournaments[_tournamentId];
        for (uint256 i = 0; i < tournament.players.length; i++)
            if (keccak256(abi.encodePacked(player)) == keccak256(abi.encodePacked(tournament.players[i])))
                return true;
        return false;
    }

    function addMatchToTournaments(string memory _player1, string memory _player2, uint256 _score1, uint256 _score2, uint256 _tournamentId) private {
        Tournament storage tournament = tournaments[_tournamentId];
        if (tournament.status == false)
            revert TournamentClosed();
        if (!isInTournament(_tournamentId, _player1))
            revert TournamentDoesntExist();
        if (!isInTournament(_tournamentId, _player2))
            revert TournamentDoesntExist();
        Match memory newMatch = Match(_player1, _score1, _player2, _score2);
        tournament.matches.push(newMatch);
    }

    function getPlayers(uint256 _tournamentId) public view returns (string[] memory players) {
        if (_tournamentId >= nbrTournament)
            revert TournamentDoesntExist();
        Tournament storage tournament = tournaments[_tournamentId];
        return (tournament.players);
    }

    function getMatches(uint256 _tournamentId) public view returns (Match[] memory matches){
        if (_tournamentId >= nbrTournament)
            revert TournamentDoesntExist();
        Tournament storage tournament = tournaments[_tournamentId];
        return (tournament.matches);
    }

    function closeTournament(uint256 _tournamentId) internal {
        if (_tournamentId >= nbrTournament)
            revert TournamentDoesntExist();
        Tournament storage tournament = tournaments[_tournamentId];
        tournament.status = false;
    }
}