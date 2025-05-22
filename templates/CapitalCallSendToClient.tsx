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

interface CapitalCallSendToClientEmailProps {
  username: string;
  title: string;
  capitalCallUrl: string;
  commitmentAmount: number;
  bankName: string;
  accountName: string;
  IBAN: string;
  accountNumber: string;
  swiftCode: string;
  branch: string;
}

const CapitalCallSendToClient: React.FC<CapitalCallSendToClientEmailProps> = ({
  username,
  title,
  capitalCallUrl,
  commitmentAmount,
  bankName,
  accountName,
  IBAN,
  accountNumber,
  swiftCode,
  branch,
}) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Capital Call received for ${title} - Capital M</Preview>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png`}
              width="70"
              height="70"
              alt="Capital M"
            />
          </Section>

          <Text style={nameText}>Dear {username}</Text>

          <Text style={heroText}>
            This Capital Call is generated for a payment to be made in response
            to your subscription request for the investment in <b>{title}</b> in
            Capital M.
          </Text>

          <Text style={text}>
            <span>
              {
                "To subscribe and participate in this opportunity, please click on below button:"
              }
            </span>
          </Text>

          <Button style={button} href={capitalCallUrl}>
            View
          </Button>

          <Text style={text}>
            <span>{"Please find below details of payment due:"}</span>
          </Text>

          <Text style={text}>
            Investment Amount:{" "}
            <span style={{ fontWeight: "bold" }}>
              AED {commitmentAmount.toLocaleString()}
            </span>
          </Text>

          <Text style={text}>
            <span>{"Bank Details:"}</span>
          </Text>

          <Text style={text}>
            Bank Name: <span style={{ fontWeight: "bold" }}>{bankName}</span>
          </Text>
          <Text style={text}>
            Account Name:{" "}
            <span style={{ fontWeight: "bold" }}>{accountName}</span>
          </Text>
          <Text style={text}>
            IBAN: <span style={{ fontWeight: "bold" }}>{IBAN}</span>
          </Text>
          <Text style={text}>
            Account Number:{" "}
            <span style={{ fontWeight: "bold" }}>{accountNumber}</span>
          </Text>
          <Text style={text}>
            Swift Code: <span style={{ fontWeight: "bold" }}>{swiftCode}</span>
          </Text>
          <Text style={text}>
            Branch: <span style={{ fontWeight: "bold" }}>{branch}</span>
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

export default CapitalCallSendToClient;

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
