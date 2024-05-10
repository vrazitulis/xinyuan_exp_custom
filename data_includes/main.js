
PennController.ResetPrefix(null) // Shorten command names (keep this line here)

// DebugOff()   // Uncomment this line only when you are 100% done designing your experiment

//generate random unique 8 characters for each participant at the beginning of every experiment
uniqueID = Array.from({ length: 8 }, () => 
  Math.floor(Math.random() * 16)
    .toString(16)
).join('');

Header(
    // void
)

.log( "UID" , uniqueID )

Header(
    // Declare global variables to store the participant's ID and information
    newVar("ID").global(),
    newVar("AGE").global(),
    newVar("GENDER").global(),
    newVar("EDUCATION").global(),
    newVar("ACCURACY", []).global(),
     // Delay of 250ms before every trial
    newTimer(250)
        .start()
        .wait()
)
 // Add the particimant info to all trials' results lines
.log( "id"     , getVar("ID") )
.log( "age"    , getVar("AGE") )
.log( "gender" , getVar("GENDER") )
.log( "education" , getVar("EDUCATION") );


// Show the 'intro' trial first, then all the 'experiment' trials in a random order
// then send the results and finally show the trial labeled 'bye'
Sequence( "ethics", "setcounter",  "participants",  "instruction", randomize("exercise"), "start_experiment", rshuffle("experiment-item", "experiment-filler") , SendResults() , "bye" )

// Ethics agreement: participants must agree before continuing
newTrial("ethics",
    newHtml("ethics_explanation", "ethics.html")
        .cssContainer({"margin":"1em"})
        .print()
    ,
newHtml("form", `<div class='fancy'><input name='consent' id='consent' type='checkbox'><label for='consent'>我已阅读并理解实验须知且同意参加这项研究。我的参与是自愿的。我知道我可以随时选择停止参与本研究，无需给出理由，也不会造成任何不利后果。我声明我同意记录研究数据作为研究的一部分并以伪或匿名形式使用。</label></div>`)
        .cssContainer({"margin":"1em"})
        .print()
    ,
    newFunction( () => $("#consent").change( e=>{
        if (e.target.checked) getButton("go_to_info").enable()._runPromises();
        else getButton("go_to_info").disable()._runPromises();
    }) ).call()
    ,
    newButton("go_to_info", "开始实验")
        .cssContainer({"margin":"2em"})
        .disable()
        .print()
        .wait()
);

// Start the next list as soon as the participant agrees to the ethics statement
// This is different from PCIbex's normal behavior, which is to move to the next list once 
// the experiment is completed. In my experiment, multiple participants are likely to start 
// the experiment at the same time, leading to a disproportionate assignment of participants
// to lists.
SetCounter("setcounter");

// Participant information: questions appear as soon as information is input
newTrial("participants",
    defaultText
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em"})
        .print()
    ,
    newText("你的ID: "+uniqueID)
        .print()
    ,
    newText("participant_info_header", "<div class='fancy'><h2>欢迎您参加试验！</p><p>为了更好的分析实验结果，请您填写以下信息。</h2><p>您的所有信息将被严格的以匿名方式处理及储存，任何人都无法识别到您的个人信息。</p></div>")
    ,
    // Participant ID (8-place)
    newText("participantID", "<b>请复制并输入上方您的参与ID。</b><br>(请按回车键确认输入)")
    ,
    newTextInput("input_ID")
        .length(8)
        .log()
        .print()
        .wait()
    ,
    // Age
    newText("<b>年龄</b><br>(请按回车键确认输入)")
    ,
    newTextInput("input_age")
        .length(2)
        .log()
        .print()
        .wait()
    ,
    // Gender
    newText("<b>性别</b>")
    ,
    newScale("input_gender",   "女",  "男",  "其他任何")
        .radio()
        .log()
        .labelsPosition("right")
        .print()
        .wait()
    ,
    // Education
    newText("<b>学历</b><br>(请填写您已完成或在读的最高学历并按回车键确认输入)")
    ,
    newTextInput("input_education")
        .log()
        .print()
        .wait()
     ,
    // Clear error messages if the participant changes the input
    newKey("just for callback", "") 
        .callback( getText("errorage").remove() , getText("errorID").remove() )
    ,
    // Formatting text for error messages
    defaultText.color("Crimson").print()
    ,
    // Continue. Only validate a click when ID and age information is input properly
    newButton("continue", "继续")
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em"})
        .print()
        // Check for participant ID and age input
        .wait(
             newFunction('dummy', ()=>true).test.is(true)
            // ID
            .and( getTextInput("input_ID").testNot.text("")
                .failure( newText('errorID', "请您正确输入本页上方的参与ID，ID为8位随机数字与字母组合。") )
            // Age
            ).and( getTextInput("input_age").test.text(/^\d+$/)
                .failure( newText('errorage', "请正确的输入您的年龄。"), 
                          getTextInput("input_age").text("")))  
        )
    ,
    // Store the texts from inputs into the Var elements
    getVar("ID")     .set( getTextInput("input_ID") ),
    getVar("AGE")    .set( getTextInput("input_age") ),
    getVar("GENDER") .set( getScale("input_gender") ),
    getVar("EDUCATION")   .set( getTextInput("input_education") )
);



newTrial( "instruction" ,
    newText("指导语")
        .center()
        .css("font-size", "2em")
        .print()
    ,
    newText("instruction", "<p>在本次阅读测试中，你会看到一系列的下划线代表每句话中的词或短语，空格代表其中之间的间隙。</p><p>在读每个句子时，每次按下<b><font color=\"red\">空格键</font></b>都会显示下一个词或短语，并且同时隐藏上一个部分。也就是说，一次只能显示一个词或短语。</p><p>在每句话之后，你必须回答一个关于这句话的<b><font color=\"blue\">问题</font></b>，根据这句话的意思，你可以选择“是”或“否”，按<b>“F”表示“是”，按“J”表示“否”</b>。</p><p>你的任务是尽可能快地阅读这个句子，并且正确回答问题。电脑会记录你按下空格键所花的时间，以及你对问题的回答。</p><p>阅读时请始终将手指放在<b><font color=\"red\">空格键</font></b>上， 随时准备按下并阅读下一部分，以确保以正常的阅读速度阅读每个句子。</p><p>接下来, 将会提供5个练习句子来帮助你熟悉并了解实验任务。</p>") 
        .center()
        .print()
    ,
    newButton("开始练习")
        .center()
        .css("font-size", "1.5em")
        .print()
        .wait()
)

// Exercise
Template("exercise.csv", row =>
  newTrial("exercise",
           newController("DashedSentence", {s: row.SENTENCE}).css("font-size", "1.5em")
           .print()
           .log()
           .wait()
           .remove()
        ,
        newTimer(200)
            .start()
            .wait()
        ,
        newText("question", row.QUESTION)
            .css("font-size", "1.5em")
            .print("center at 50%", "middle at 40%")
        ,
        newText("choices", "F. 是&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;J. 否")
            .css("font-size", "1.5em")
            .print("center at 50%", "middle at 50%")
        ,
        newKey("FJ")
            .log()
            .wait()
    )
    .log( "item"      , row.ITEM)
);

// Start experiment
newTrial( "start_experiment" ,
    newText("<h2>现在正式开始进行实验。</h2><p>接下来的实验中，如若问题回答错误，将会有提示提醒您集中注意力去理解句意。</p>")
        .print()
    ,
    newButton("go_to_experiment", "开始试验")
        .print()
        .wait()
);

// Experimental trial
Template("final experiment items.csv", row =>
    newTrial( "experiment-"+row.TYPE,
           newController("DashedSentence", {s: row.SENTENCE}).css("font-size", "1.5em")
            .print("center at 50%", "middle at 40%")
            .log()
            .wait()
            .remove()
        ,
        newTimer(200)
            .start()
            .wait()
        ,
        newText("question", row.QUESTION)
            .css("font-size", "1.5em")
            .print("center at 50%", "middle at 40%")
        ,
        newText("choices", "F. 是&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;J. 否")
            .css("font-size", "1.5em")
            .print("center at 50%", "middle at 50%")
        ,
        newKey("FJ")
            .log()
            .wait()
    )
    .log("item", row.ITEM)
    .log("RCType", row.RCTYPE)
    .log("RCPos", row.RCPOS)
    .log("Type", row.TYPE)
    .log( "list", row.LIST)
)



newTrial( "bye" ,
    newText("感谢您参加实验!")
        .css("font-size", "1.5em")
        .print()
    ,
    newButton()
        .wait()  // Wait for a click on a non-displayed button = wait here forever
)
.setOption( "countsForProgressBar" , false )
// Make sure the progress bar is full upon reaching this last (non-)trial 