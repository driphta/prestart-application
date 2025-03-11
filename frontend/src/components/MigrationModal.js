import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton,
  Text,
  Progress,
  Alert,
  AlertIcon,
  VStack,
  Box,
  Heading,
  useDisclosure
} from '@chakra-ui/react';
import { migrateData, checkMigrationStatus } from '../utils/dbMigration';
import { setUseApi } from '../utils/db';

const MigrationModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [migrationStatus, setMigrationStatus] = useState('idle'); // idle, migrating, success, error
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [needsMigration, setNeedsMigration] = useState(false);

  // Check if migration is needed when component mounts
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const hasCloudData = await checkMigrationStatus();
        if (hasCloudData) {
          // Data already exists in the cloud, no migration needed
          setUseApi(true);
          setNeedsMigration(false);
        } else {
          // No data in the cloud, migration might be needed
          setNeedsMigration(true);
          onOpen();
        }
      } catch (error) {
        console.error('Error checking migration status:', error);
        // If we can't connect to the API, just use local storage
        setUseApi(false);
        setNeedsMigration(false);
      }
    };

    checkStatus();
  }, [onOpen]);

  const handleMigration = async () => {
    setMigrationStatus('migrating');
    setMessage('Starting migration...');
    setProgress(10);

    try {
      // Simulate progress updates (in a real implementation, you'd get progress from the migration process)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Perform the actual migration
      const result = await migrateData();
      
      clearInterval(progressInterval);
      
      if (result.success) {
        setMigrationStatus('success');
        setMessage('Migration completed successfully!');
        setProgress(100);
        setUseApi(true);
      } else {
        setMigrationStatus('error');
        setMessage(`Migration failed: ${result.message}`);
        setProgress(0);
        setUseApi(false);
      }
    } catch (error) {
      setMigrationStatus('error');
      setMessage(`Migration failed: ${error.message}`);
      setProgress(0);
      setUseApi(false);
    }
  };

  const handleSkip = () => {
    setUseApi(false);
    onClose();
  };

  const handleClose = () => {
    if (migrationStatus !== 'migrating') {
      onClose();
    }
  };

  if (!needsMigration) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} closeOnOverlayClick={false} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Data Migration</ModalHeader>
        {migrationStatus !== 'migrating' && <ModalCloseButton />}
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading size="sm" mb={2}>Migrate to Cloud Storage</Heading>
              <Text>
                Your application can now use Azure cloud storage instead of browser storage.
                Would you like to migrate your existing data to the cloud?
              </Text>
            </Box>

            {migrationStatus === 'migrating' && (
              <Box>
                <Text mb={2}>{message}</Text>
                <Progress value={progress} size="sm" colorScheme="blue" />
              </Box>
            )}

            {migrationStatus === 'success' && (
              <Alert status="success">
                <AlertIcon />
                {message}
              </Alert>
            )}

            {migrationStatus === 'error' && (
              <Alert status="error">
                <AlertIcon />
                {message}
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          {migrationStatus === 'idle' && (
            <>
              <Button colorScheme="blue" mr={3} onClick={handleMigration}>
                Migrate Data
              </Button>
              <Button variant="ghost" onClick={handleSkip}>
                Continue with Local Storage
              </Button>
            </>
          )}

          {migrationStatus === 'migrating' && (
            <Button colorScheme="blue" isDisabled>
              Migrating...
            </Button>
          )}

          {(migrationStatus === 'success' || migrationStatus === 'error') && (
            <Button colorScheme="blue" onClick={handleClose}>
              Close
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MigrationModal;
