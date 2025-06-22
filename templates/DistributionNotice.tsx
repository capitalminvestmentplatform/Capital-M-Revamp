import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import Footer from "./Footer";

interface DistributionNoticeEmailProps {
  name: string;
  clientCode: string;
  commitmentName: string;
  distributionAmount: number;
}

const DistributionNotice: React.FC<DistributionNoticeEmailProps> = ({
  name,
  clientCode,
  commitmentName,
  distributionAmount,
}) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>
          Distribution Notice received for {commitmentName} - Capital M
        </Preview>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png`}
              width="70"
              height="70"
              alt="Capital M"
            />
          </Section>

          <Text style={nameText}>Dear {name}</Text>

          <Text style={text}>
            <span>{"Distribution Notice Details:"}</span>
          </Text>

          <Text style={text}>
            Client Code:{" "}
            <span style={{ fontWeight: "bold" }}>{clientCode}</span>
          </Text>
          <Text style={text}>
            Commitment Name:{" "}
            <span style={{ fontWeight: "bold" }}>{commitmentName}</span>
          </Text>

          <Text style={text}>
            Distribution Amount:{" "}
            <span style={{ fontWeight: "bold" }}>
              AED {distributionAmount.toLocaleString()}
            </span>
          </Text>

          <Text style={text}>
            If you have any questions, feel free to reach out. We're here to
            help!
          </Text>

          <Footer />
        </Container>
      </Body>
    </Html>
  );
};

export default DistributionNotice;

const button = {
  backgroundColor: "#386264",
  color: "#ffffff",
  padding: "12px 20px",
  textDecoration: "none",
  borderRadius: "5px",
  display: "inline-block",
};

const main = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "0px 20px",
};

const logoContainer = {
  marginTop: "32px",
};

const heroText = {
  fontSize: "15px",
  lineHeight: "28px",
  marginBottom: "30px",
};
const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
};

const span = {
  fontWeight: "bold",
};

const nameText = {
  fontSize: "15px",
  lineHeight: "28px",
  marginBottom: "30px",
  fontWeight: "bold",
};
