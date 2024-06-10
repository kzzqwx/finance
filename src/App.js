import React, { useEffect, useRef, useState } from 'react';
import {Card, CardContent, Cell, TextBox, TextBoxTitle, TextBoxBigTitle, TextBoxSubTitle, useToast,
  CellListItem, Header, Button, ToastProvider, ActionButton, Container, TextBoxBiggerTitle} from '@salutejs/plasma-ui';
import {Headline3, Headline5, Modal, Select, TextField} from "@salutejs/plasma-web";
import './style.css';
import axios from "axios";
import { createAssistant, createSmartappDebugger } from '@sberdevices/assistant-client';
import {ToastForm} from "./components/ToastForm";



export function App() {

    const [transactions, setTransactions] = useState([
        { id: Math.random().toString(36).substring(7), type: 'expense', name: 'Groceries', expenseType: 'Food', amount: 50, date: new Date().toISOString() },
        { id: Math.random().toString(36).substring(7), type: 'income', name: 'Salary', incomeType: 'Job', amount: 1000, date: new Date().toISOString() }
    ]);

    let assistant;

    const initializeAssistant = (getState) => {
        if (process.env.NODE_ENV === 'development') {
            return createSmartappDebugger({
                token: process.env.REACT_APP_TOKEN ?? '',
                initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
                getState,
                // getRecoveryState: getState,
                nativePanel: {
                    defaultText: 'ччччччч',
                    screenshotMode: false,
                    tabIndex: -1,
                },
            });
        } else {
            return createAssistant({ getState });
        }
    };
    function getStateForAssistant() {
        console.log('getStateForAssistant: transactions:', transactions);

        const state = {
            item_selector: {
                items: transactions.map(({ id, type, name, expenseType, incomeType, amount, date }, index) => ({
                    number: index + 1,
                    id,
                    title: `${type === 'expense' ? 'Expense' : 'Income'}: ${name} - ${amount} on ${new Date(date).toLocaleDateString()}`,
                    type,
                    expenseType,
                    incomeType,
                    amount,
                    date,
                })),
                ignored_words: [
                     'добавить', 'установить', 'запиши', 'поставь', 'закинь', 'напомнить',
                     'удалить', 'удали',

                 ],
            },
        };

        console.log('getStateForAssistant: state:', state);
        return state;
    }


    const dispatchAssistantAction = (action) => {
        console.log('dispatchAssistantAction', action);
        if (action) {
            switch (action.type) {
                case 'add_expense':
                    return add_expense(action.name, action.expenseType, action.amount, action.date, action.context);

                case 'add_income':
                    return add_income(action.name, action.incomeType, action.amount, action.date, action.context);

                case 'delete_expense':
                    return delete_expense(action);

                default:
                    throw new Error(`Unknown action type: ${action.type}`);
            }
        }
    };


    useEffect(() => {
        console.log('componentDidMount');
        assistant = initializeAssistant(() => getStateForAssistant());

        assistant.on('data', (event) => {
            console.log('assistant.on(data)', event);
            if (event.type === 'character') {
                console.log(`assistant.on(data): character: "${event?.character?.id}"`);
            } else if (event.type === 'insets') {
                console.log('assistant.on(data): insets');
            } else {
                const { action } = event;
                dispatchAssistantAction(action);
            }
        });

        assistant.on('start', (event) => {
            let initialData = assistant.getInitialData();
            console.log(`assistant.on(start)`, event, initialData);
        });

        assistant.on('command', (event) => {
            console.log(`assistant.on(command)`, event);
        });

        assistant.on('error', (event) => {
            console.log(`assistant.on(error)`, event);
        });

        assistant.on('tts', (event) => {
            console.log(`assistant.on(tts)`, event);
        });
    }, []);



    function add_expense(name, expenseType, amount, date, context) {

    }

    function add_income(name, incomeType, amount, date, context) {

    }

    function delete_expense(action) {

    }

    function _send_action_value(action_id, value) {
        const data = {
            action: {
                action_id: action_id,
                parameters: {
                    value: value,
                },
            },
        };
        const unsubscribe = this.assistant.sendData(data, (data) => {
            const { type, payload } = data;
            console.log('sendData onData:', type, payload);
            unsubscribe();
        });
    }


    //Expense
        const [isExpenseOpen, setIsExpenseOpen] = React.useState(false);
        const closeExpense = React.useCallback(() => {
            setIsExpenseOpen(false);
        });
        const [dateInputExpense, setDateInputExpense] = React.useState('');
        const [dateExpense, setDateExpense] = useState('');
        const [nameExpense, setNameExpense] = useState('');
        const [amountExpense, setAmountExpense] = useState('');
        const handleNameChangeExpense = (e) => {
            setNameExpense(e.target.value);
        };
        const handleAmountChangeExpense = (e) => {
            setAmountExpense(e.target.value);
        };
        const handleDateChangeExpense = (e) => {
            setDateInputExpense(e.target.value);
        };
        const items_Expense = [
            {value: 1, label: 'Одежда'},
            {value: 2, label: 'Продукты'},
            {value: 3, label: 'Дом'},
            {value: 4, label: 'Рестораны'},
            {value: 5, label: 'Услуги'},
            {value: 6, label: 'Развлечения'}
        ];
        //Income
        const [isIncomeOpen, setIsIncomeOpen] = React.useState(false);
        const closeIncome = React.useCallback(() => {
            setIsIncomeOpen(false);
        });
        const [dateInputIncome, setDateInputIncome] = React.useState('');
        const [dateIncome, setDateIncome] = useState(null);
        const [nameIncome, setNameIncome] = useState('');
        const [amountIncome, setAmountIncome] = useState('');
        const handleNameChangeIncome = (e) => {
            setNameIncome(e.target.value);
        };
        const handleAmountChangeIncome = (e) => {
            setAmountIncome(e.target.value);
        };
        const handleDateChangeIncome = (e) => {
            setDateInputIncome(e.target.value);
        };
        const items_Income = [
            {value: 1, label: 'Зарплата'},
            {value: 2, label: 'Подарок'},
            {value: 3, label: 'Иной доход',}
        ];

        //Connect backend
        const [expenseTransactions, setExpenseTransactions] = useState([]);
        const [incomeTransactions, setIncomeTransactions] = useState([]);
        const fetchDataAll = () => {
            const user_id = 1;
            axios.get('http://45.147.177.32:8000/api/v1/finance', {
                params: {user_id: user_id}
            }).then(response => {
                setExpenseTransactions(response.data.transactions.expense);
                setIncomeTransactions(response.data.transactions.income);
            }).catch(error => {
                console.error('Error fetching data:', error);
            });
        };

        useEffect(() => {
            fetchDataAll();
        }, []);

        const getLabelByValueExpense = (value) => {
            const item = items_Expense.find(item => item.value === value);
            return item ? item.label : 'Неизвестно';
        };


        //ExpenceForm
        const handleSubmitExpense = async () => {
            const user_id = 1;
            const data = {
                tag_id: dateExpense, // Предполагается, что dateExpense содержит id тега
                name: nameExpense,
                date: dateInputExpense,
                amount: parseFloat(amountExpense)
            };

            try {
                await axios.post(`http://45.147.177.32:8000/api/v1/finance/expense?user_id=${user_id}`, data);

                closeExpense();
                fetchDataAll();
                setDateInputExpense('');
                setDateExpense('');
                setNameExpense('');
                setAmountExpense('');

            } catch (error) {
                console.error("There was an error creating the expense!", error, data);
            }
        };
        //IncomeForm
        const handleSubmitIncome = async () => {
            const user_id = 1;
            const data = {
                tag_id: dateIncome, // Предполагается, что dateExpense содержит id тега
                name: nameIncome,
                date: dateInputIncome,
                amount: parseFloat(amountIncome)
            };

            try {
                await axios.post(`http://45.147.177.32:8000/api/v1/finance/income?user_id=${user_id}`, data);
                closeIncome();
                fetchDataAll();
                setDateInputIncome('');
                setDateIncome('');
                setNameIncome('');
                setAmountIncome('');

            } catch (error) {
                console.error("There was an error creating the income!", error, data);
            }
        };
        const getLabelByValueIncome = (value) => {
            const item = items_Income.find(item => item.value === value);
            return item ? item.label : 'Неизвестно';
        };

        //DeleteExpense
    const [isExpenseDeleteOpen, setIsExpenseDeleteOpen] = React.useState(false);
    const closeExpenseDelete = React.useCallback(() => {
        setIsExpenseDeleteOpen(false);
    });
    const [idExpense, setIdExpense] = useState('');
    const handleIdDeleteExpense = (e) => {
        setIdExpense(e.target.value);
    };

        //DeleteIncome
    const [isIncomeDeleteOpen, setIsIncomeDeleteOpen] = React.useState(false);
    const closeIncomeDelete = React.useCallback(() => {
        setIsIncomeDeleteOpen(false);
    });
    const [idIncome, setIdIncome] = useState('');
    const handleIdDeleteIncome = (e) => {
        setIdIncome(e.target.value);
    };


        return (
            <div className="App">
                <ToastProvider>
                    <div className="my-header">
                        <Header style={{width: '50rem', marginLeft: '7.5rem'}}
                                back={true}
                                title="Finance"
                                subtitle="Приложение, помогающее следить за деньгами"/>
                    </div>
                    <div className="buttons-bar">
                        <Button size="l" pin="circle-circle"
                                text="Добавить расходы" onClick={() => setIsExpenseOpen(true)}/>
                        <Modal isOpen={isExpenseOpen} onClose={closeExpense}>
                            <Headline3 mb={20}>Добавить расходы</Headline3>

                            <Headline5 mt={10} mb={10}>Название</Headline5>
                            <TextField placeholder="Объект"
                                       required='true'
                                       value={nameExpense}
                                       onChange={handleNameChangeExpense}
                            />
                            <Headline5 mt={10} mb={10}>Тип:</Headline5>
                            <Select
                                required='true'
                                value={dateExpense}
                                items={items_Expense}
                                onChange={setDateExpense}
                                placeholder="Выберите..."
                                status="success"
                            />
                            <Headline5 mt={10} mb={10}>Стоимость:</Headline5>
                            <TextField
                                required='true'
                                placeholder="Введите сумму"
                                type='number'
                                value={amountExpense}
                                onChange={handleAmountChangeExpense}
                            />
                            <Headline5 mt={10} mb={10}>Дата покупки:</Headline5>
                            <TextField
                                required='true'
                                type="date"
                                value={dateInputExpense}
                                onChange={handleDateChangeExpense}
                            />
                            <Button m={10} stretch="true" text="Добавить" onClick={handleSubmitExpense}
                                    className="button-bar-modal"/>
                        </Modal>
                        <Button style={{marginLeft: '0.5rem'}} size="l" pin="circle-circle"
                                text="Добавить доходы" onClick={() => setIsIncomeOpen(true)}/>
                        <Modal isOpen={isIncomeOpen} onClose={closeIncome}>
                            <Headline3 mb={20}>Добавить доходы </Headline3>
                            <Headline5 mt={10} mb={10}>Название:</Headline5>
                            <TextField placeholder="Объект"
                                       required='true'
                                       value={nameIncome}
                                       onChange={handleNameChangeIncome}/>
                            <Headline5 mt={10} mb={10}>Тип:</Headline5>
                            <Select
                                required='true'
                                value={dateIncome}
                                items={items_Income}
                                onChange={setDateIncome}
                                placeholder="Выберите..."
                                status="success"
                            />
                            <Headline5 mt={10} mb={10}>Сумма:</Headline5>
                            <TextField
                                required='true'
                                placeholder="Введите сумму"
                                type='number'
                                value={amountIncome}
                                onChange={handleAmountChangeIncome}
                            />
                            <Headline5 mt={10} mb={10}>Дата зачисления:</Headline5>
                            <TextField
                                required='true'
                                type="date"
                                value={dateInputIncome}
                                onChange={handleDateChangeIncome}
                            />
                            <Button stretch="true" text="Добавить" onClick={handleSubmitIncome} className="button-bar-modal"/>
                        </Modal>
                        <Button style={{marginLeft: '0.5rem'}} size="l" pin="circle-circle"
                                text="Удалить расходы" onClick={() => setIsExpenseDeleteOpen(true)}/>
                        <Modal isOpen={isExpenseDeleteOpen} onClose={closeExpenseDelete}>
                            <Headline3 mb={20}>Удалить расходы</Headline3>
                            <Headline5 mt={10} mb={10}>Введите id из списка "Расходы":</Headline5>
                            <TextField
                                required='true'
                                type='number'
                                value={idExpense}
                                onChange={handleIdDeleteExpense}
                            />
                            <Button style={{marginTop: '2rem'}} stretch="true" text="Удалить"/>
                        </Modal>
                        <Button style={{marginLeft: '0.5rem'}} size="l" pin="circle-circle"
                                text="Удалить доходы" onClick={() => setIsIncomeDeleteOpen(true)}/>
                        <Modal isOpen={isIncomeDeleteOpen} onClose={closeIncomeDelete}>
                            <Headline3 mb={20}>Удалить доход</Headline3>
                            <Headline5 mt={10} mb={10}>Введите id из списка "Доходы":</Headline5>
                            <TextField
                                required='true'
                                type='number'
                                value={idIncome}
                                onChange={handleIdDeleteIncome}
                            />
                            <Button style={{marginTop: '2rem'}} stretch="true" text="Удалить"/>
                        </Modal>
                        <ToastForm/>
                    </div>
                    <div className="cards-row">
                        <Card style={{width: '29rem', marginLeft: '0.75rem', padding: '0.5rem'}}>
                            <CardContent className="scrollable-content" compact>
                                <Cell content={<TextBoxBigTitle>Расходы:</TextBoxBigTitle>}/>
                                {expenseTransactions.map((transaction, index) => (
                                    <CellListItem
                                        key={index}
                                        content={
                                            <TextBox>
                                                <TextBoxTitle>{transaction.name}</TextBoxTitle>
                                                <div className="row-notes">
                                                    <TextBoxSubTitle>Дата: {transaction.date}</TextBoxSubTitle>
                                                    <TextBoxSubTitle>Сумма: {transaction.amount} </TextBoxSubTitle>
                                                    <TextBoxSubTitle>Тип: {getLabelByValueExpense(transaction.tag_id)} </TextBoxSubTitle>
                                                </div>
                                            </TextBox>
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>
                        <Card style={{width: '29rem', marginLeft: '0.75rem', padding: '0.5rem'}}>
                            <CardContent className="scrollable-content" compact>
                                <Cell content={<TextBoxBigTitle>Доходы:</TextBoxBigTitle>}/>
                                {incomeTransactions.map((transaction, index) => (
                                    <CellListItem
                                        key={index}
                                        content={
                                            <TextBox>
                                                <TextBoxTitle>{transaction.name}</TextBoxTitle>
                                                <div className="row-notes">
                                                    <TextBoxSubTitle>Дата: {transaction.date}</TextBoxSubTitle>
                                                    <TextBoxSubTitle>Сумма: {transaction.amount} </TextBoxSubTitle>
                                                    <TextBoxSubTitle>Тип: {getLabelByValueIncome(transaction.tag_id)} </TextBoxSubTitle>
                                                </div>

                                            </TextBox>
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>
                        <Card style={{ width: '21rem', maxHeight: '17rem' , marginLeft: '0.75rem', padding: '0.5rem'}}>
                            <CardContent compact>
                                <Cell
                                    content={<TextBoxBigTitle>Общая сумма расходов: </TextBoxBigTitle>}
                                />
                                <Cell
                                    content={<TextBoxBiggerTitle>Value</TextBoxBiggerTitle>}

                                    alignRight="center"
                                />
                            </CardContent>
                            <CardContent compact>
                                <Cell
                                    content={<TextBoxBigTitle>Общая сумма расходов: </TextBoxBigTitle>}
                                />
                                <Cell
                                    content={<TextBoxBiggerTitle>Value</TextBoxBiggerTitle>}

                                    alignRight="center"
                                />
                            </CardContent>
                        </Card>
                    </div>

                </ToastProvider>
            </div>
        );
    }
