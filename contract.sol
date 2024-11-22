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
        string Winner;
        string Loser;
        uint256 WinningScore;
        uint256 LosingScore;
    }

    uint256 nbrTournament;
    mapping(uint256 => Tournament) private tournaments;

    event previewTournament(uint256 indexed tournamentId, string[] players);

    event publishMatch(uint256 indexed tournamentId, uint256 indexed bracketId, string Winner, string Loser, uint256 WinnerScore, uint256 LoserScore);

    event publishTournament(uint256 indexed tournamentId, string[] players, string Winner);

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
        emit previewTournament(nbrTournament, _players);
        return nbrTournament - 1;
    }

    function isInTournament(uint256 _tournamentId, string memory player) public view returns (bool) {
        uint256 tId = _tournamentId;
        if (tId > nbrTournament)
            revert TournamentDoesntExist();
        Tournament storage tournament = tournaments[tId];
        for (uint256 i = 0; i < tournament.players.length; i++)
            if (keccak256(abi.encodePacked(player)) == keccak256(abi.encodePacked(tournament.players[i])))
                return true;
        return false;
    }

    function addMatchToTournaments(string memory _player1, string memory _player2, uint256 _score1, uint256 _score2, uint256 _tournamentId, uint256 _bracketId) public onlyOwner {
        uint256 tId = _tournamentId - 1;
        Tournament storage tournament = tournaments[tId];
        if (tournament.status == false)
            revert TournamentClosed();
        if (!isInTournament(tId, _player1))
            revert TournamentDoesntExist();
        if (!isInTournament(tId, _player2))
            revert TournamentDoesntExist();
        Match memory newMatch = Match({
            Winner: _player1,
            Loser: _player2,
            WinningScore: _score1,
            LosingScore: _score2
        });

        tournament.matches.push(newMatch);
        emit publishMatch(_tournamentId, _bracketId, _player1, _player2, _score1, _score2);
    }


    function closeTournament(uint256 _tournamentId, string memory _winner) public onlyOwner {
        uint256 tId = _tournamentId - 1;
        if (tId > nbrTournament)
            revert TournamentDoesntExist();
        Tournament memory tournament = tournaments[tId];
        tournament.status = false;
        emit publishTournament(tId, tournament.players, _winner);
    }
}
