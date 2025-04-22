import { InvestmentProps } from "@/types/investments";
import React from "react";

interface InvestmentCardProps {
  investment: InvestmentProps;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ investment }) => {
  return <div>{investment.title}</div>;
};

export default InvestmentCard;
