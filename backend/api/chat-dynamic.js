export default function dynamicChatResponse(req, res) {
    const { key, inputs } = req.body;

    if (key === "plan_recommendation_based_on_team") {
        const size = parseInt(inputs.ask_business_size);

        let msg = "";
        if (size <= 3) msg = "For small teams, the Basic Plan is perfect.";
        else if (size <= 10) msg = "The Pro Plan is ideal for your growing team.";
        else msg = "For large teams, we recommend our Enterprise Plan.";

        return res.json({ message: msg, nextStep: "start" });
    }

    if (key === "auto_answer_or_handoff") {
        const question = inputs.ask_question || "your query";

        return res.json({
            message: `Thanks for your question! Our agent will help you with "${question}".`,
            nextStep: "start"
        });
    }

    return res.json({ message: "I didn't understand that.", nextStep: "start" });
}
