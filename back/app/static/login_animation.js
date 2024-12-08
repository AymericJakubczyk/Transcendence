random = 0
paddleInterval = null;


function calculBall_animation() {
    // Gestion des collisions avec les murs
    if (y + dy > arenaWidth - thickness/2 - ballRadius || y + dy < thickness/2 + ballRadius ) {
        light_bump_effect_wall.position.set(x, y + dy * 2, 3)
        light_bump_effect_wall.intensity = 20
        console.log("[WALL]")
        dy = -dy;
    }

    // Gestion des collisions avec les paddles
    if (x > arenaLength - thickness * 2) {
        if (y > paddle_2.position.y - paddleHeight / 2 && y < paddle_2.position.y + paddleHeight / 2) {
            paddle_2Light.intensity = 50
            nbrHit++
            // set random between -4 and 4 for tap the ball on the border of the paddle
            random = Math.floor(Math.random() * 8) - 4
            dx = -baseSpeed - (0.04 * nbrHit)
            let hitPos = y - paddle_2.position.y;
            dy = hitPos * 0.15;
        } else {
            nbrHit = 0;
            playerScore++; // Opponent marque un point
            ballDirection = -1; // Le ballon se dirige vers l'adversaire
            explodeBall()
            resetBall();
        }
    }

    if (x < thickness * 2) {
        if (y > paddle_1.position.y - paddleHeight / 2 && y < paddle_1.position.y + paddleHeight / 2) {
            paddle_1Light.intensity = 50
            nbrHit++
            // set random between -4 and 4 for tap the ball on the border of the paddle
            random = Math.floor(Math.random() * 8) - 4
            dx = baseSpeed + (0.04 * nbrHit)
            let hitPos = y - paddle_1.position.y;
            dy = hitPos * 0.15;
        } else {
            nbrHit = 0;
            opponentScore++; // Player marque un point
            ballDirection = 1; // Le ballon se dirige vers le joueur
            explodeBall()
            resetBall();
        }
    }

    if (!explosion)
    {
        x += dx;
        y += dy;
        ball.position.x = x;
        ball.position.y = y;
    }

    // Mouvement des paddles
    if (wPressed && paddle_1.position.y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2)
        paddle_1.position.y += 0.6;
    if (sPressed && paddle_1.position.y - 0.6 > thickness / 2 + paddleHeight / 2)
        paddle_1.position.y -= 0.6;

    if (upPressed && paddle_2.position.y + 0.6 < arenaWidth - thickness / 2 - paddleHeight / 2)
        paddle_2.position.y += 0.6;
    if (downPressed && paddle_2.position.y - 0.6 > thickness / 2 + paddleHeight / 2)
        paddle_2.position.y -= 0.6;

    if (paddle_1Light.position.y != paddle_1.position.y)
        paddle_1Light.position.y = paddle_1.position.y
    if (paddle_2Light.position.y != paddle_2.position.y)
        paddle_2Light.position.y = paddle_2.position.y


    // rotate the scene around the center point of the plane
    pivotPoint.rotation.z += 0.003




    
    renderer.render( scene, camera );
    if (paddle_1Light.intensity > 5)
        paddle_1Light.intensity -= 5
    if (paddle_2Light.intensity > 5)
        paddle_2Light.intensity -= 5
    if (light_bump_effect_wall.intensity > 0)
        light_bump_effect_wall.intensity -= 2
}


function movePaddle()
{
    if (dx > 0)
    {
        if (Math.abs(paddle_2.position.y - y) < 5)
            step = 0.1
        else
            step = 1

        if (paddle_2.position.y + random < y && paddle_2.position.y + 0.5 < arenaWidth - thickness / 2 - paddleHeight / 2)
                paddle_2.position.y += step;
        else if (paddle_2.position.y + random > y && paddle_2.position.y - 0.5 > thickness / 2 + paddleHeight / 2)
            paddle_2.position.y -= step;
    }
    if (dx < 0)
    {
        if (Math.abs(paddle_1.position.y - y) < 5)
            step = 0.1
        else
            step = 1

        if (paddle_1.position.y + random < y && paddle_1.position.y + 0.5 < arenaWidth - thickness / 2 - paddleHeight / 2)
            paddle_1.position.y += step;
        else if (paddle_1.position.y + random > y && paddle_1.position.y - 0.5 > thickness / 2 + paddleHeight / 2)
            paddle_1.position.y -= step;
    }
}

function cam_animation()
{
    // change camera position
    camera.position.z = 100;
    camera.position.x = -0;
    camera.position.y = arenaWidth / 2;
    camera.up.set(1,0,0)
    camera.lookAt(new THREE.Vector3(arenaLength/2,arenaWidth/2,0))
    if (reverse)
    {
        camera.position.x = arenaLength + arenaWidth / 3;
        camera.lookAt(new THREE.Vector3(arenaLength/2,arenaWidth/2,0))
        camera.rotation.z = Math.PI / 2;
    }
    console.log("pos", ball.position)
    renderer.render(scene, camera);
}