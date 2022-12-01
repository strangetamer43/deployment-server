import responseModel from "../models/Response.js";
import questionModel from "../models/Questions.js";
import userModel from "../models/user.js";
export const submitResponse = async (req, res) => {
    try {
        const response = req.body.response
        console.log(response)
        var data = {
            quizId: req.body.quizId,
            userId: req.body.userId,
            quizName: req.body.quizName,
            userName: req.body.userName,
            response,
            videos: req.body.videos
        }
        console.log(data);
        questionModel.findById(data.quizId, async (err, result) => {

            if (err) {
                res.status(403).json({ message: "Quiz not found" })
            } else {
                let j = 0;
                let correctAnswer = 0;
                for (let i = 0; i < result.questions.length; i++) {

                    if (j < response.length) {
                        if (result.questions[i].id === response[j].questionId) {
                            if (result.questions[i].questionType === "mcq") {
                                var option = result.questions[i].options.find(o => o.option === response[j].option)
                                console.log(option)
                                correctAnswer += option.value;
                                j += 1;
                            } else {
                                j += 1;
                            }

                        }
                    }

                }
                let grade = ""
                if (result.scoring === "normal") {
                    for (let i = 0; i < result.result.data.length; i++) {
                        if (correctAnswer <= result.result.data[i][0] && correctAnswer >= result.result.data[i][1]) {
                            grade = result.result.data[i][2];
                            break
                        }
                    }
                } else {
                    var attributeValue = req.body.attribute;
                    for (let i = 0; i < result.numericalRange.length; i++) {
                        if (attributeValue <= result.numericalRange[i].numericalRange[0] && attributeValue >= result.numericalRange[i].numericalRange[1]) {
                            for (let j = 0; j < result.numericalRange[i].scoreRange.length; j++) {
                                if (correctAnswer <= result.numericalRange[i].scoreRange[j][0] && correctAnswer >= result.numericalRange[i].scoreRange[j][1]) {
                                    correctAnswer = result.numericalRange[i].scoreRange[j][2]
                                    grade = result.numericalRange[i].scoreRange[j][3]
                                }
                            }
                        }
                    }
                }

                data["grade"] = grade;
                data["correctAnswers"] = correctAnswer;
                console.log(data)
                var newResponse = new responseModel(data);
                await newResponse.save().then((docs) => {
                    userModel.updateOne(
                        { _id: data.userId },
                        { $push: { responses: data.quizId } })
                        .then(() => {
                            console.log("New quiz reponse is added")
                        }).catch(error => console.log(error))
                    res.status(203).json(docs);
                })
            }
        })

    } catch (error) {
        res.status(403).json({ message: error.message })

    }
}

// get all response of a user 
export const getResponsesByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        responseModel.find({ userId: userId }, (err, result) => {
            if (err) {
                res.status(403).json({ message: err.message })
            } else {
                res.status(203).json(result)
            }
        })

    } catch (error) {
        res.status(403).json({ message: error.message })

    }
}


// get a response by response id 
export const getResponse = async (req, res) => {
    try {
        const responseId = req.params.responseId;
        responseModel.findById(responseId, (err, result) => {
            if (err) {
                res.status(403).json({ message: err.message })
            } else {
                res.status(203).json(result)
            }
        })
    } catch (error) {
        res.status(403).json({ message: err.message })
    }
}


export const getResponseByQuizId = async (req, res) => {
    try {
        const quizId = req.params.quizId;

        responseModel.find({ quizId }, (err, result) => {
            if (err) {
                console.log(result)
                res.status(403).json({ message: err.message })
            } else {
                res.status(203).json(result)
            }
        })
    } catch (error) {
        res.status(403).json({ message: err.message })


    }
}

export const getAllResponse = async (req, res) => {
    try {
        responseModel.find((err, result) => {
            if (err) {
                res.status(403).json({ message: error })
            } else {
                res.status(203).json(result)
            }
        })
    } catch (error) {

    }
}

export const submittingQuiz = async (req, res) => {
    try {
        const userId = req.body.userId;
        const quizId = req.body.quizId;

        questionModel.findById(quizId, (err, qresult) => {
            if (err) {
                res.status(403).json({ message: err.message })
            } else {
                const attempts = qresult.attempts;
                userModel.findById(userId, (err, uresult) => {
                    const responses = uresult.responses;
                    if (err) {
                        res.status(403).json({ message: err.message })
                    } else {
                        if (!uresult?.responses) {
                            res.status(203).json({ message: "User is allowed to take the quiz" })

                        }
                        else if (responses.filter(x => x.valueOf() === quizId).length < attempts) {

                            res.status(203).json({ message: "User is allowed to take the quiz" })

                        } else {
                            res.status(403).json({ message: "User is not allowed to take the quiz" })
                        }
                    }



                })

            }
        })

    } catch (error) {
        res.status(403).json({ message: error.message })

    }
}


export const getResponseByUserName = async (req, res) => {
    try {
        const search = req.params.search;
        const result = await responseModel.aggregate([{

            '$search': {
                'index': 'default',
                'text': {
                    'query': search,
                    'path': {
                        'wildcard': '*'
                    }
                }
            }

        }])
        console.log(result);
        res.status(203).json(result)
    } catch (error) {
        res.status(403).json({ message: error.message })


    }
}


// get a response by a question id 
