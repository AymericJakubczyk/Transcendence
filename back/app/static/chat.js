function display_addable_discussion()
{
    if (document.getElementById("all_addable").hidden)
    {
        document.getElementById("all_discussion").hidden = true
        document.getElementById("all_addable").hidden = false
        document.getElementById("add_btn").innerHTML = "CANCEL"
        document.getElementById("txt_discu").innerHTML = "new discussion"
    }
    else
    {
        document.getElementById("all_discussion").hidden = false
        document.getElementById("all_addable").hidden = true
        document.getElementById("add_btn").innerHTML = "ADD +"
        document.getElementById("txt_discu").innerHTML = "all discussions"
    }
}