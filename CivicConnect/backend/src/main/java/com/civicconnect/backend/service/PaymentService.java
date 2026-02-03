package com.civicconnect.backend.service;

import com.civicconnect.backend.model.Donation;
import com.civicconnect.backend.model.Ngo;
import com.civicconnect.backend.model.User;
import com.civicconnect.backend.repository.DonationRepository;
import com.civicconnect.backend.repository.NgoRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PaymentService {

        @Value("${stripe.api.key}")
        private String stripeApiKey;

        @Autowired
        private DonationRepository donationRepository;

        @Autowired
        private NgoRepository ngoRepository;

        @PostConstruct
        public void init() {
                Stripe.apiKey = stripeApiKey;
                seedIndianNgos();
        }

        // 1. Create Stripe Checkout Session (Redirects user to Stripe)
        public String createCheckoutSession(Long ngoId, Double amount) throws Exception {
                Ngo ngo = ngoRepository.findById(ngoId).orElseThrow();

                SessionCreateParams params = SessionCreateParams.builder()
                                .setMode(SessionCreateParams.Mode.PAYMENT)
                                // Success URL: Redirects back to your React app with parameters
                                .setSuccessUrl("http://localhost:5173/donation/success?session_id={CHECKOUT_SESSION_ID}&ngo_id="
                                                + ngoId + "&amount=" + amount)
                                .setCancelUrl("http://localhost:5173/donations")
                                .addLineItem(
                                                SessionCreateParams.LineItem.builder()
                                                                .setQuantity(1L)
                                                                .setPriceData(
                                                                                SessionCreateParams.LineItem.PriceData
                                                                                                .builder()
                                                                                                .setCurrency("inr")
                                                                                                .setUnitAmount((long) (amount
                                                                                                                * 100)) // Stripe
                                                                                                                        // expects
                                                                                                                        // paisa
                                                                                                .setProductData(
                                                                                                                SessionCreateParams.LineItem.PriceData.ProductData
                                                                                                                                .builder()
                                                                                                                                .setName("Donation to "
                                                                                                                                                + ngo.getName())
                                                                                                                                .setDescription("Supporting: "
                                                                                                                                                + ngo.getCategory())
                                                                                                                                .build())
                                                                                                .build())
                                                                .build())
                                .build();

                Session session = Session.create(params);
                return session.getUrl();
        }

        // 2. Save Donation to Database (Called after successful payment)
        public Donation saveDonation(User user, Long ngoId, Double amount, String txnId) {
                // Idempotency Check: Don't save if already exists
                return donationRepository.findByStripePaymentId(txnId).orElseGet(() -> {
                        Ngo ngo = ngoRepository.findById(ngoId).orElseThrow();
                        Donation donation = new Donation();
                        donation.setDonor(user);
                        donation.setNgo(ngo);
                        donation.setAmount(amount);
                        donation.setStripePaymentId(txnId);
                        donation.setStatus("SUCCESS");
                        return donationRepository.save(donation);
                });
        }

        // 3. Generate PDF Receipt
        public byte[] generateReceiptPdf(Long donationId) throws Exception {
                Donation donation = donationRepository.findById(donationId).orElseThrow();
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                Document document = new Document();
                PdfWriter.getInstance(document, out);

                document.open();

                Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
                Paragraph title = new Paragraph("CivicConnect Donation Receipt", titleFont);
                title.setAlignment(Element.ALIGN_CENTER);
                document.add(title);
                document.add(new Paragraph("\n"));

                document.add(new Paragraph("Receipt ID: " + donation.getStripePaymentId()));
                document.add(new Paragraph("Date: " + donation.getDonationDate().toString()));
                document.add(new Paragraph("Donor: " + donation.getDonor().getUsername()));
                document.add(new Paragraph("NGO: " + donation.getNgo().getName()));
                document.add(new Paragraph("------------------------------------------------"));

                Font amtFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
                document.add(new Paragraph("Amount Donated: ₹" + donation.getAmount(), amtFont));

                document.add(new Paragraph("\n\nThank you for making a difference!"));
                document.add(new Paragraph("This is a computer-generated receipt."));

                document.close();
                return out.toByteArray();
        }

        public List<Ngo> getAllNgos() {
                return ngoRepository.findAll();
        }

        // 4. Seed Database (Reset Data to Fix Broken Images)
        private void seedIndianNgos() {
                try {
                        // Force clean up of old/broken data
                        donationRepository.deleteAll();
                        ngoRepository.deleteAll();

                        // Add NGOs with Reliable Placeholder Images
                        saveNgo("Goonj", "Addresses rural poverty using urban discard.", "Disaster Relief",
                                        "https://placehold.co/600x400/2ecc71/ffffff/png?text=Goonj");

                        saveNgo("GiveIndia", "India's trusted giving platform.", "Platform",
                                        "https://placehold.co/600x400/e74c3c/ffffff/png?text=GiveIndia");

                        saveNgo("CRY", "Ensuring children in India have a happy childhood.", "Child Welfare",
                                        "https://placehold.co/600x400/f1c40f/333333/png?text=CRY");

                        saveNgo("HelpAge India", "Works for the cause of disadvantaged older persons.", "Elderly Care",
                                        "https://placehold.co/600x400/3498db/ffffff/png?text=HelpAge");

                        saveNgo("Akshaya Patra", "Eliminating classroom hunger with mid-day meals.", "Hunger Relief",
                                        "https://placehold.co/600x400/9b59b6/ffffff/png?text=Akshaya");

                        saveNgo("Pratham", "Innovative learning organization for education.", "Education",
                                        "https://placehold.co/600x400/e67e22/ffffff/png?text=Pratham");

                        saveNgo("WWF India", "Stopping the degradation of the planet.", "Environment",
                                        "https://placehold.co/600x400/1abc9c/ffffff/png?text=WWF");

                        saveNgo("Sewa Int.", "Humanitarian aid and development.", "Development",
                                        "https://placehold.co/600x400/34495e/ffffff/png?text=Sewa");

                        System.out.println("✅ NGOs Database Refreshed Successfully");

                } catch (Exception e) {
                        System.err.println("⚠️ Warning during seeding: " + e.getMessage());
                }
        }

        private void saveNgo(String name, String desc, String cat, String url) {
                Ngo ngo = new Ngo();
                ngo.setName(name);
                ngo.setDescription(desc);
                ngo.setCategory(cat);
                ngo.setLogoUrl(url);
                ngo.setTargetAmount("Continuous");
                ngoRepository.save(ngo);
        }
}