function gameView() {
    document.getElementById('page').innerHTML = `
    <div class="container-fluid">
        <h1 class="header">ULTIMATE EXTRA COOL SUPER PONG TOURNAMENT EXTREME BATTLE</h1>
        <h5 class="header">Welcome in the history</h5>
        <div class="row main-box">
            <div class="game-box col-9">
                <h3>GAME</h3>
            </div>
            <div class="leaderboard-box col-3">
                <h3>LEADERBOARD</h3>
            </div>
        </div>
        <div class="row stats-box">
        <div class="col-3 stats-id">
            <img src="/static/srcs/test.jpg" alt="Profile pic">
            <h2>PSEUDO</h2>
        </div>
        <div class="col-9 row stats-content">
            <div class="col-3 stats-content-place">
                <h3>PLACE</h6>
                <h6>Unranked</h6>
            </div>
            <div class="col-9 row stats-content-others">
                <div class="col-6">
                    <h3>Rank</h6>
                    <h6>Unranked</h6>
                </div>
                <div class="col-6">
                    <h3>Max exchange</h6>
                    <h6>Unvailable</h6>
                </div>
                <div class="col-6">
                    <h3>Games played</h6>
                    <h6>Unvailable</h6>
                </div>
                <div class="col-6">
                    <h3>Winrate</h6>
                    <h6>Unvailable</h6>
                </div>
            </div>
        </div>
    </div>
    `;
    return '';
}