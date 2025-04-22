import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export default function ForgotPasswordEmail({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Reset your password</Preview>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png"
              width="70"
              height="70"
              alt="Company Logo"
            />
          </Section>

          <Heading style={h1}>Reset Your Password</Heading>

          <Text style={nameText}>Hello {name},</Text>

          <Text style={heroText}>
            You recently requested to reset your password. Click the button
            below to reset it.
          </Text>

          <Button style={button} href={resetUrl}>
            Reset Password
          </Button>

          <Text style={text}>
            If you did not request a password reset, please ignore this email.
          </Text>

          <Section>
            <Row style={footerLogos}>
              <Column style={{ width: "66%" }}>
                <Img
                  src="https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png"
                  width="70"
                  height="70"
                  alt="Company Logo"
                />
              </Column>
              <Column>
                <Section>
                  <Row>
                    <Column>
                      <Link href="https://twitter.com">
                        <Img
                          src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
                          width="20"
                          height="20"
                          alt="Twitter"
                          style={socialMediaIcon}
                        />
                      </Link>
                    </Column>
                    <Column>
                      <Link href="https://facebook.com">
                        <Img
                          src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                          width="20"
                          height="20"
                          alt="Facebook"
                          style={socialMediaIcon}
                        />
                      </Link>
                    </Column>
                    <Column>
                      <Link href="https://linkedin.com">
                        <Img
                          src="https://cdn-icons-png.flaticon.com/512/733/733561.png"
                          width="20"
                          height="20"
                          alt="LinkedIn"
                          style={socialMediaIcon}
                        />
                      </Link>
                    </Column>
                  </Row>
                </Section>
              </Column>
            </Row>
          </Section>

          <Section>
            <Text style={footerText}>
              ©{new Date().getFullYear()} Versatile Synergy. <br />
              7th Floor, Mostafa Bin Abdullatif, O-14 Chedder Cheese Tower
              Marasi Drive Business Bay Dubai <br />
              <br />
              All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const footerText = {
  fontSize: "12px",
  color: "#b7b7b7",
  lineHeight: "15px",
  textAlign: "left" as const,
  marginBottom: "50px",
};

const button = {
  backgroundColor: "#386264",
  color: "#ffffff",
  padding: "12px 20px",
  textDecoration: "none",
  borderRadius: "5px",
  display: "inline-block",
};

const footerLogos = {
  marginBottom: "32px",
  paddingLeft: "8px",
  paddingRight: "8px",
  display: "block",
};

const socialMediaIcon = {
  display: "inline",
  marginLeft: "32px",
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

const h1 = {
  color: "#1d1c1d",
  fontSize: "25px",
  fontWeight: "700",
  margin: "30px 0",
  padding: "0",
  lineHeight: "42px",
};

const heroText = {
  fontSize: "15px",
  lineHeight: "28px",
  marginBottom: "30px",
};

const nameText = {
  fontSize: "15px",
  lineHeight: "28px",
  marginBottom: "30px",
  fontWeight: "bold",
};

const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
};
