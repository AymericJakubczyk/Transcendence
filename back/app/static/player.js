function whosPlaying(oldColor)
{
	var blackPlayer = document.getElementById("BlackPlayer");
	var whitePlayer = document.getElementById("WhitePlayer");
	if (oldColor == "black")
	{
		blackPlayer.setAttribute("style", "opacity: 0.2;");	
		whitePlayer.setAttribute("style", "opacity: 1;");	
	}
	else
	{
		blackPlayer.setAttribute("style", "opacity: 1;");	
		whitePlayer.setAttribute("style", "opacity: 0.2;");	
	}	
}